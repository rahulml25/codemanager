use crate::constants::{CODEBASES_DIR, SQLITE_DB_KEY};
use rusqlite::{self, Connection};

pub fn open_encrypted_db() -> rusqlite::Result<Connection> {
    // Open the database connection
    let database_path = CODEBASES_DIR.join("codebases_data.db");
    let conn = Connection::open(database_path)?;

    // Set the encryption key (password)
    conn.execute_batch(&format!("PRAGMA key = '{}';", SQLITE_DB_KEY.to_string()))?;

    Ok(conn)
}
