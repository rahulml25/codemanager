use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppResponse<T> {
    pub data: T,
    pub success: bool,
}

impl<T> AppResponse<T> {
    // A method to create a new instance of the generic struct
    pub fn new_ok(data: T) -> Self {
        AppResponse {
            data,
            success: true,
        }
    }

    pub fn new_err(data: T) -> Self {
        AppResponse {
            data,
            success: false,
        }
    }
}
