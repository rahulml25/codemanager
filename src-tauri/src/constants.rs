#[cfg(not(feature = "secrets"))]
use std::env;
use std::path::PathBuf;

use lazy_static::lazy_static;

lazy_static! {
    pub static ref HOME_DIR: PathBuf = dirs::home_dir().unwrap();
    pub static ref BASE_DIR: PathBuf = HOME_DIR.join(".codemg");

    pub static ref BIN_DIR: PathBuf = BASE_DIR.join("bin");
    pub static ref CODEBASES_DIR: PathBuf = BASE_DIR.join("codebases");

    // Codebases - sub-dirs
    pub static ref CODEBASES_NEW_DIR: PathBuf = CODEBASES_DIR.join("new_entries");
}

#[cfg(not(feature = "secrets"))]
lazy_static! {
    pub static ref JWT_SECRET: String =
        env::var("JWT_SECRET").expect("JWT_SECRET not found in dev environment");
    pub static ref SQLITE_DB_KEY: String =
        env::var("SQLITE_DB_KEY").expect("SQLITE_DB_KEY not found in dev environment");
}

#[cfg(feature = "secrets")]
pub use crate::secrets::{JWT_SECRET, SQLITE_DB_KEY};
