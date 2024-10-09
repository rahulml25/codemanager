mod constants;
pub mod utils;

use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
struct Language {
    Name: String,
    Code: usize,
}
