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
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            // Get Operations
            get_projects,
            get_previous_projects,
            //
            // Create Operations
            create_project,
            //
            // Update Operations
            update_project,
            relocate_project,
            change_defaultProject_onpath,
            //
            // Delete Operations
            delete_existing_project,
            delete_relocatable_project,
            delete_previousProject_onpath,
            //
            // Extended Features
            mesure_codebase,
            get_user_credentials,
            check_relocatable_existance,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
