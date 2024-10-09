use std::fs;
use std::io::Read;
use std::os::windows::fs::MetadataExt;

use chrono::{DateTime, TimeZone, Utc};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use rusqlite::{params, Connection};

use crate::constants::JWT_SECRET;
use crate::constants::{BIN_DIR, CODEBASES_NEW_DIR};
use crate::db::open_encrypted_db;
use crate::schemas::project::Project;
use crate::schemas::project_claims::ProjectClaims;

pub fn safely_create_important_dirs() {
    if !BIN_DIR.exists() {
        fs::create_dir_all(BIN_DIR.as_path()).unwrap();
    }
    if !CODEBASES_NEW_DIR.exists() {
        fs::create_dir_all(CODEBASES_NEW_DIR.as_path()).unwrap();
    }
}

pub(crate) fn secure_projects_table(conn: &Connection) {
    // conn.execute("DROP TABLE IF EXISTS projects", []).unwrap();

    let mut stmt = conn.prepare("PRAGMA table_info(projects)").unwrap();
    let project_table_exists = stmt.exists([]).unwrap();

    if !project_table_exists {
        conn.execute(
            "CREATE TABLE projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                template TEXT NOT NULL,
                path TEXT,
                description TEXT NOT NULL,
                _createdAt DATETIME NOT NULL,
                _isActive BOOLEAN NOT NULL
            )",
            [],
        )
        .unwrap();
    }
}

#[allow(non_snake_case)]
pub(crate) fn secure_adderIds_table(conn: &Connection) {
    let mut stmt = conn.prepare("PRAGMA table_info(adderIds)").unwrap();
    let project_table_exists = stmt.exists([]).unwrap();

    if !project_table_exists {
        conn.execute(
            "CREATE TABLE adderIds (
                adder_id TEXT PRIMARY KEY
            )",
            [],
        )
        .unwrap();
    }
}

pub(crate) fn check_new_projects() {
    let mut new_entries: Vec<(String, DateTime<Utc>)> = vec![];

    let entries = fs::read_dir(CODEBASES_NEW_DIR.as_path()).unwrap();

    // Checks for *.cb files in "~/.codemg/codebases/new" directory
    for entry in entries {
        let entry = entry.unwrap();
        let metadata = entry.metadata().unwrap();
        let path = entry.path();

        if path.is_file()
            && entry.file_name().to_str().unwrap().ends_with(".cb")
            && metadata.len() > 0
        {
            let filepath = path.to_str().unwrap().to_string();

            let creation_time = (metadata.creation_time() - 116444736000000000) * 100; // Convert from 100-ns intervals to nanoseconds since Unix epoch
            let created_at_datetime = Utc
                .timestamp_opt(
                    (creation_time / 1_000_000_000) as i64,
                    (creation_time % 1_000_000_000) as u32,
                )
                .unwrap();

            new_entries.push((filepath, created_at_datetime));
        }
    }

    if new_entries.is_empty() {
        return;
    }

    let mut new_projects: Vec<Project> = vec![];

    let decoding_key = DecodingKey::from_secret(JWT_SECRET.to_string().as_ref());
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = false;

    // Connection to the database
    let conn = open_encrypted_db().unwrap();
    secure_projects_table(&conn);
    secure_adderIds_table(&conn);

    for (filepath, created_at) in &new_entries {
        let mut file = fs::File::open(filepath).unwrap();

        let mut data = String::new();
        file.read_to_string(&mut data).unwrap();

        // making new project
        match decode::<ProjectClaims>(&data, &decoding_key, &validation) {
            Ok(token_data) => {
                let claims = token_data.claims;

                // Find if adder_id already present in the database
                let mut stmt = conn
                    .prepare("SELECT adder_id FROM adderIds WHERE adder_id == ?1")
                    .unwrap();
                let already_added = stmt.exists(params![claims.adder_id]).unwrap();

                if already_added {
                    eprintln!("duplicate adder_id");
                    fs::remove_file(filepath).unwrap();
                    continue;
                };

                // Save the adder_id if not exist
                conn.execute(
                    "INSERT INTO adderIds (adder_id) VALUES (?1)",
                    params![claims.adder_id],
                )
                .unwrap();

                let mut project = Project::new(
                    claims.name,
                    claims.template.to_string(),
                    claims.path,
                    String::new(),
                )
                .unwrap();
                project._createdAt = *created_at;

                new_projects.push(project);
            }
            Err(err) => {
                eprintln!("Token is invalid: {}", err);
            }
        }

        // delete the file
        fs::remove_file(filepath).unwrap();
    }

    println!("Token is valid. Claims: {:#?}", new_projects);

    // Finds path matches and Set the newest as default. Turn previous ones off.
    for new_project in new_projects {
        // if any filepath matches and not active off: -> "make that inactive" & "keep only new one as showing"
        conn.execute(
            "UPDATE projects
                    SET _isActive = ?1
                    WHERE path == ?2",
            params![false, new_project.path],
        )
        .unwrap();

        // Insert new project
        conn.execute(
            "INSERT INTO projects
                (id, name, template, path, description, _createdAt, _isActive)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            ",
            params![
                new_project.id.clone(),
                new_project.name.clone(),
                new_project.template.to_string(),
                new_project.path.clone(),
                new_project.description.clone(),
                new_project._createdAt.to_rfc3339(),
                new_project._isActive,
            ],
        )
        .unwrap();
    }
}
