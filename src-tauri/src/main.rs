// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod constants;
mod db;

mod internal;
use internal::features::*;
use internal::utils::{check_new_projects, safely_create_important_dirs};

mod scc;
mod schemas;

#[cfg(feature = "secrets")]
mod secrets;

use dotenv::dotenv;

fn main() {
    dotenv().ok();
    safely_create_important_dirs();
    check_new_projects();

    tauri::Builder::default()
        // .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_projects,
            get_previous_projects,
            // create_project,
            update_project,
            mesure_codebase,
            relocate_project,
            change_defaultProject_onpath,
            delete_previousProject_onpath,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
