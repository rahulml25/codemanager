use super::project::ProjectTemplate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectClaims {
    pub name: String,
    pub template: ProjectTemplate,
    pub path: String,

    // Extra info(s)
    pub adder_id: String,
    exp: usize,
}
