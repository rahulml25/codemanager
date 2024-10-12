use lazy_static::lazy_static;
use parking_lot::Mutex;
use std::collections::{HashMap, HashSet};
use std::path::Path;

use chrono::DateTime;
use rusqlite::params;
use whoami;

use super::utils::{check_new_projects, get_auth_challenge, get_device_id, secure_projects_table};
use crate::db::open_encrypted_db;
use crate::scc::utils::codebase_statistics;
use crate::schemas::app_response::AppResponse;
use crate::schemas::project::{self, Project};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn get_projects() -> Vec<Project> {
    // Checking for new projects
    check_new_projects();

    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare(
            "SELECT id, name, template, path, description, _createdAt, _isActive, _isRelocatable
                FROM projects
                WHERE _isActive == ?1
            ",
        )
        .unwrap();
    let projects = stmt
        .query_map(params![true], |row| {
            let template_map = project::PROJECT_TEMPLATE_MAP.lock();

            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                template: template_map[&row.get::<usize, String>(2)?],
                path: row.get(3)?,
                description: row.get(4)?,
                _createdAt: DateTime::parse_from_rfc3339(row.get::<usize, String>(5)?.as_str())
                    .unwrap()
                    .to_utc(),
                _isActive: row.get(6)?,
                _isRelocatable: row.get(7)?,
            })
        })
        .unwrap()
        .map(|x| x.unwrap())
        .collect::<Vec<Project>>();

    projects
}

#[allow(non_snake_case)]
#[tauri::command]
pub fn get_previous_projects(
    currentDefaultId: String,
) -> Result<AppResponse<Vec<Project>>, AppResponse<String>> {
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare(
            "SELECT path FROM projects
                WHERE id == ?1 AND _isActive == ?2",
        )
        .unwrap();
    let does_exists = stmt.exists(params![currentDefaultId, true]).unwrap();

    if !does_exists {
        return Err(AppResponse::new_err(format!("project doesn't exist")));
    }

    let path = stmt
        .query_row(params![currentDefaultId, true], |row| {
            row.get::<usize, String>(0)
        })
        .unwrap();

    if !Path::new(&path).exists() {
        return Err(AppResponse::new_err("Path does not exists".to_string()));
    }

    let mut stmt = conn
        .prepare(
            "SELECT id, name, template, path, description, _createdAt, _isActive, _isRelocatable
                FROM projects
                WHERE path == ?1 AND _isActive == ?2
            ",
        )
        .unwrap();
    let projects = stmt
        .query_map(params![path, false], |row| {
            let template_map = project::PROJECT_TEMPLATE_MAP.lock();

            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                template: template_map[&row.get::<usize, String>(2)?],
                path: row.get(3)?,
                description: row.get(4)?,
                _createdAt: DateTime::parse_from_rfc3339(row.get::<usize, String>(5)?.as_str())
                    .unwrap()
                    .to_utc(),
                _isActive: row.get(6)?,
                _isRelocatable: row.get(7)?,
            })
        })
        .unwrap()
        .map(|x| x.unwrap())
        .collect::<Vec<Project>>();

    Ok(AppResponse::new_ok(projects))
}

#[tauri::command]
pub fn create_project(
    name: String,
    template: String,
    path: String,
    description: String,
) -> Result<AppResponse<Project>, AppResponse<String>> {
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare("SELECT id FROM projects WHERE path == ?1 AND _isActive == ?2")
        .unwrap();
    let already_exists = stmt.exists(params![path, true]).unwrap();

    if already_exists {
        return Err(AppResponse::new_err(format!("duplicate path")));
    };

    if !Path::new(&path).exists() {
        return Err(AppResponse::new_err(format!("Path does not exists")));
    }

    let new_project = match Project::new(name, template, path, description) {
        Ok(project) => project,
        Err(err_msg) => return Err(AppResponse::new_err(err_msg.to_string())),
    };

    conn.execute(
        "INSERT INTO projects (id, name, template, path, description, _createdAt, _isActive, _isRelocatable) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            new_project.id.clone(),
            new_project.name.clone(),
            new_project.template.to_string(),
            new_project.path.clone(),
            new_project.description.clone(),
            new_project._createdAt.to_rfc3339(),
            new_project._isActive,
            new_project._isRelocatable,
        ],
    )
    .unwrap();

    Ok(AppResponse::new_ok(new_project))
}

#[tauri::command]
pub fn update_project(project: Project) -> Result<AppResponse<Project>, AppResponse<String>> {
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare("SELECT id FROM projects WHERE id == ?1")
        .unwrap();
    let does_exists = stmt.exists(params![project.id]).unwrap();

    if !does_exists {
        return Err(AppResponse::new_err(format!("project doesn't exist")));
    }

    // Verify Project
    match project.verify() {
        Err(err_msg) => return Err(AppResponse::new_err(err_msg.to_string())),
        _ => (),
    };

    conn.execute(
        "UPDATE projects
            SET name = ?1, template = ?2, path = ?3, description = ?4
            WHERE id == ?5",
        params![
            project.name.clone(),
            project.template.to_string(),
            project.path.clone(),
            project.description.clone(),
            project.id.clone(),
        ],
    )
    .unwrap();

    Ok(AppResponse::new_ok(project))
}

/**
 * Relocate missing Project path
 */
#[allow(non_snake_case)]
#[tauri::command]
pub fn relocate_project(
    projectId: String,
    newPath: String,
) -> Result<AppResponse<bool>, AppResponse<String>> {
    if !Path::new(&newPath).exists() {
        return Err(AppResponse::new_err(format!("given path doesn't exist")));
    }

    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare(
            "SELECT path FROM projects
                    WHERE id == ?1 AND _isActive == ?2 AND _isRelocatable == ?3",
        )
        .unwrap();
    let does_exists = stmt.exists(params![projectId, true, true]).unwrap();

    if !does_exists {
        return Err(AppResponse::new_err(format!("project doesn't exist")));
    }

    let oldPath = stmt
        .query_row(params![projectId, true, true], |row| {
            row.get::<usize, String>(0)
        })
        .unwrap();

    let oldPath = Path::new(&oldPath);
    if oldPath.exists() {
        return Err(AppResponse::new_err(format!("old path already exists")));
    }

    conn.execute(
        "UPDATE projects
            SET path = ?1, _isRelocatable = ?2
            WHERE id == ?3",
        params![newPath, false, projectId],
    )
    .unwrap();

    Ok(AppResponse::new_ok(true))
}

#[allow(non_snake_case)]
#[tauri::command]
pub fn change_defaultProject_onpath(
    currentDefaultId: String,
    newDefaultId: String,
    path: String,
) -> Result<AppResponse<bool>, AppResponse<String>> {
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    if !Path::new(&path).exists() {
        return Err(AppResponse::new_err(format!("Path does not exists")));
    }

    let mut stmt = conn
        .prepare("SELECT id FROM projects WHERE id == ?1 AND path == ?2 AND _isActive == ?3")
        .unwrap();
    let defaultProject = stmt.exists(params![currentDefaultId, path, true]).unwrap();

    if !defaultProject {
        return Err(AppResponse::new_err(format!("default Project not found")));
    }

    let mut stmt = conn
        .prepare("SELECT id FROM projects WHERE id == ?1 AND path == ?2 AND _isActive == ?3")
        .unwrap();
    let previousProject = stmt.exists(params![newDefaultId, path, false]).unwrap();

    if !previousProject {
        return Err(AppResponse::new_err(format!("previous Project not Found")));
    };

    conn.execute(
        "UPDATE projects SET _isActive = ?1
                WHERE id == ?2 AND path == ?3",
        params![false, currentDefaultId, path],
    )
    .unwrap();
    conn.execute(
        "UPDATE projects SET _isActive = ?1
                WHERE id == ?2 AND path == ?3",
        params![true, newDefaultId, path],
    )
    .unwrap();

    Ok(AppResponse::new_ok(true))
}

#[allow(non_snake_case)]
#[tauri::command]
pub fn delete_relocatable_project(
    projectId: String,
) -> Result<AppResponse<bool>, AppResponse<String>> {
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare(
            "SELECT path FROM projects
                    WHERE id == ?1 AND _isActive == ?2 AND _isRelocatable == ?3",
        )
        .unwrap();
    let does_exists = stmt.exists(params![projectId, true, true]).unwrap();

    if !does_exists {
        return Err(AppResponse::new_err(format!("project doesn't exist")));
    }

    let path = stmt
        .query_row(params![projectId, true, true], |row| {
            row.get::<usize, String>(0)
        })
        .unwrap();

    if Path::new(&path).exists() {
        return Err(AppResponse::new_err(format!("Path already exists")));
    }

    conn.execute(
        "DELETE FROM projects
            WHERE id == ?1 AND path == ?2 AND _isRelocatable == ?3",
        params![projectId, path, true],
    )
    .unwrap();

    return Ok(AppResponse::new_ok(true));
}

#[allow(non_snake_case)]
#[tauri::command]
pub fn delete_previousProject_onpath(
    currentDefaultId: String,
    previousProjectId: String,
    path: String,
) -> Result<AppResponse<bool>, AppResponse<String>> {
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    if !Path::new(path.as_str()).exists() {
        return Err(AppResponse::new_err(format!("Path does not exists")));
    }

    let mut stmt = conn
        .prepare("SELECT id FROM projects WHERE id == ?1 AND path == ?2 AND _isActive == ?3")
        .unwrap();
    let defaultProject = stmt.exists(params![currentDefaultId, path, true]).unwrap();

    if !defaultProject {
        return Err(AppResponse::new_err(format!("default Project not found")));
    }

    let mut stmt = conn
        .prepare("SELECT id FROM projects WHERE id == ?1 AND path == ?2 AND _isActive == ?3")
        .unwrap();
    let previousProject = stmt
        .exists(params![previousProjectId, path, false])
        .unwrap();

    if !previousProject {
        return Err(AppResponse::new_err(format!("previous Project not Found")));
    };

    conn.execute(
        "DELETE FROM projects WHERE id == ?1 AND path == ?2",
        params![previousProjectId, path],
    )
    .unwrap();

    Ok(AppResponse::new_ok(true))
}

#[allow(non_snake_case)]
#[tauri::command]
pub fn delete_existing_project(
    projectId: String,
    challenge: String,
) -> Result<AppResponse<bool>, AppResponse<String>> {
    // Challenge Authentication
    {
        let mut challenges = AUTH_CHALLENGES.lock();
        let curr_challenge = &(projectId.clone(), challenge.clone());
        let challenge_exists = challenges.contains(curr_challenge);

        if !challenge_exists {
            return Err(AppResponse::new_err(format!("challenge doesn't exist")));
        }

        challenges.remove(curr_challenge);
    }

    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare(
            "SELECT path FROM projects
                WHERE id == ?1 AND _isActive == ?2",
        )
        .unwrap();
    let does_exists = stmt.exists(params![projectId, true]).unwrap();

    if !does_exists {
        return Err(AppResponse::new_err(format!("project doesn't exist")));
    }

    let path = stmt
        .query_row(params![projectId, true], |row| row.get::<usize, String>(0))
        .unwrap();

    if !Path::new(&path).exists() {
        return Err(AppResponse::new_err(format!("Path doesn't exist")));
    }

    conn.execute(
        "DELETE FROM projects
            WHERE id == ?1 AND path == ?2 AND _isActive == ?3",
        params![projectId, path, true],
    )
    .unwrap();

    return Ok(AppResponse::new_ok(true));
}

#[allow(non_snake_case)]
#[tauri::command]
pub fn mesure_codebase(
    projectId: String,
) -> Result<AppResponse<(HashMap<String, usize>, usize)>, AppResponse<String>> {
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare(
            "SELECT path FROM projects
                WHERE id == ?1 AND _isActive == ?2",
        )
        .unwrap();
    let does_exists = stmt.exists(params![projectId, true]).unwrap();

    if !does_exists {
        return Err(AppResponse::new_err(format!("project doesn't exist")));
    }

    let path = stmt
        .query_row(params![projectId, true], |row| row.get::<usize, String>(0))
        .unwrap();

    if !Path::new(&path).exists() {
        conn.execute(
            "UPDATE projects SET _isRelocatable = ?1 WHERE id == ?2",
            params![true, projectId],
        )
        .unwrap();
        return Err(AppResponse::new_err("Path does not exists".to_string()));
    }

    let codebase_stat = codebase_statistics(path);

    if codebase_stat.is_err() {
        let msg = codebase_stat.unwrap_err();
        return Err(AppResponse::new_err(msg.to_string()));
    }

    let (language_map, total_code) = codebase_stat.unwrap();

    Ok(AppResponse::new_ok((language_map, total_code)))
}

#[allow(non_snake_case)]
#[tauri::command]
pub fn check_relocatable_existance(
    projectId: String,
) -> Result<AppResponse<bool>, AppResponse<String>> {
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);

    let mut stmt = conn
        .prepare(
            "SELECT path FROM projects
                    WHERE id == ?1 AND _isActive == ?2 AND _isRelocatable == ?3",
        )
        .unwrap();
    let does_exists = stmt.exists(params![projectId, true, true]).unwrap();

    if !does_exists {
        return Err(AppResponse::new_err(format!("project doesn't exist")));
    }

    let path = stmt
        .query_row(params![projectId, true, true], |row| {
            row.get::<usize, String>(0)
        })
        .unwrap();

    if !Path::new(&path).exists() {
        return Ok(AppResponse::new_ok(false));
    }

    conn.execute(
        "UPDATE projects
            SET _isRelocatable = ?1
            WHERE id == ?2 AND path == ?3",
        params![false, projectId, path],
    )
    .unwrap();

    Ok(AppResponse::new_ok(true))
}

// Backend Static variables
lazy_static! {
    static ref AUTH_CHALLENGES: Mutex<HashSet<(String, String)>> = Mutex::new(HashSet::new());
}

#[allow(non_snake_case)]
#[tauri::command]
pub fn get_user_credentials(projectId: String) -> (String, String, String, String) {
    let realname = whoami::realname();
    let name = whoami::username();
    let challenge = get_auth_challenge();
    let user_id = get_device_id().unwrap();

    let mut challenges = AUTH_CHALLENGES.lock();
    challenges.insert((projectId, challenge.clone()));

    return (challenge, user_id, name, realname);
}
