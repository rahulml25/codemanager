use dotenv::dotenv;
use std::{env, fs::File, io::Write};

fn write_secrets(env_vars: Vec<&str>, file_path: &str) {
    let mut file_contents: Vec<String> = vec![];
    for var_name in env_vars {
        let var_value =
            env::var(var_name).expect(&format!("{var_name} not found in build environment"));
        file_contents.push(format!("pub const {var_name}: &str = \"{var_value}\";"));
    }

    let mut file = File::create(file_path).unwrap(); // Creates or overwrites "output.txt"
    let file_contents = file_contents.join("\n");
    file.write_all(file_contents.as_bytes()).unwrap(); // Writes content to the file
}

fn main() {
    dotenv().ok();
    
    let env_variables: Vec<&str> = vec!["JWT_SECRET", "SQLITE_DB_KEY"];
    write_secrets(env_variables, "src/secrets.rs");

    tauri_build::build()
}
