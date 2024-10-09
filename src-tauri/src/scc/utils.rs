use std::{collections::HashMap, ffi::OsStr};
use tauri::api::process::Command;

use super::constants::{GROUPED_LANGUAGES_MAP, MULTIPART_LANGUAGES, SUPPORTED_LANGUAGES};
use super::Language;

fn get_codebase_data(path: &str) -> Result<String, String> {
    let output_res = Command::new_sidecar("scc")
        .unwrap()
        .args([path, "-f", "json"])
        .output();

    if output_res.is_err() {
        let msg = output_res.unwrap_err();
        return Err(format!("{}", msg.to_string()));
    }

    let output = output_res.unwrap();

    if !output.status.success() {
        return Err(format!("Failed to execute command: {}", output.stderr));
    }

    let output_json = output.stdout.trim().to_string();

    Ok(output_json.clone())
}

pub fn codebase_statistics<T: AsRef<OsStr>>(
    path: T,
) -> Result<(HashMap<String, usize>, usize), String> {
    let path = OsStr::new(&path);
    let codebase_data = get_codebase_data(path.to_str().unwrap())?;
    let languages = match serde_json::from_str::<Vec<Language>>(&codebase_data) {
        Ok(data) => data,
        Err(err) => return Err(err.to_string()),
    };

    let mut code_map: HashMap<String, usize> = HashMap::new();
    let mut total_code: usize = 0;

    for language in languages {
        if !SUPPORTED_LANGUAGES.contains_key(language.Name.as_str()) {
            continue;
        }

        total_code += language.Code;
        if GROUPED_LANGUAGES_MAP.contains_key(language.Name.as_str()) {
            let idx = GROUPED_LANGUAGES_MAP[language.Name.as_str()];
            let group_key = MULTIPART_LANGUAGES[idx][0];

            match code_map.contains_key(group_key) {
                true => *code_map.get_mut(group_key).unwrap() += language.Code,
                false => {
                    code_map.insert(group_key.to_string(), language.Code);
                }
            }
            continue;
        }

        code_map.insert(language.Name, language.Code);
    }

    Ok((code_map, total_code))
}
