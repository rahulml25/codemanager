use chrono::DateTime;
use chrono::Utc;
use std::path::PathBuf;
use uuid::Uuid;

use lazy_static::lazy_static;
use parking_lot::Mutex;
use std::collections::HashMap;

use serde::de::{self, Unexpected, Visitor as DeVisitor};
use serde::{Deserialize, Serialize};
use serde::{Deserializer, Serializer};
use std::fmt;

#[allow(non_camel_case_types)]
#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
pub enum ProjectTemplate {
    Normal,
    Python,
    Python_Sep,
    NodeJs,
    NodeJs_Ts,
    NextJs,
    Rust,
}

lazy_static! {
    pub static ref PROJECT_TEMPLATE_MAP: Mutex<HashMap<String, ProjectTemplate>> =
        Mutex::new(HashMap::from([
            ("normal".to_string(), ProjectTemplate::Normal),
            ("python".to_string(), ProjectTemplate::Python),
            ("python-sep".to_string(), ProjectTemplate::Python_Sep),
            ("nodejs".to_string(), ProjectTemplate::NodeJs),
            ("nodejs-ts".to_string(), ProjectTemplate::NodeJs_Ts),
            ("nextjs".to_string(), ProjectTemplate::NextJs),
            ("rust".to_string(), ProjectTemplate::Rust),
        ]));
    static ref PROJECT_TEMPLATE_STR_MAP: Mutex<HashMap<ProjectTemplate, String>> =
        Mutex::new(HashMap::from([
            (ProjectTemplate::Normal, "normal".to_string()),
            (ProjectTemplate::Python, "python".to_string()),
            (ProjectTemplate::Python_Sep, "python-sep".to_string()),
            (ProjectTemplate::NodeJs, "nodejs".to_string()),
            (ProjectTemplate::NodeJs_Ts, "nodejs-ts".to_string()),
            (ProjectTemplate::NextJs, "nextjs".to_string()),
            (ProjectTemplate::Rust, "rust".to_string()),
        ]));
}

impl ProjectTemplate {
    pub fn to_string(&self) -> String {
        let template_str_map = PROJECT_TEMPLATE_STR_MAP.lock();
        template_str_map[self].clone()
    }
}

impl Serialize for ProjectTemplate {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let template_str = self.to_string();
        serializer.serialize_str(&template_str)
    }
}

impl<'de> Deserialize<'de> for ProjectTemplate {
    fn deserialize<D>(deserializer: D) -> Result<ProjectTemplate, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct ProjectTemplateVisitor;

        impl<'de> DeVisitor<'de> for ProjectTemplateVisitor {
            type Value = ProjectTemplate;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("enum ProjectTemplate")
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: de::Error,
            {
                let template_map = PROJECT_TEMPLATE_MAP.lock();
                match template_map.get(value) {
                    Some(template) => Ok(*template),
                    None => Err(de::Error::invalid_value(Unexpected::Str(value), &self)),
                }
            }
        }

        deserializer.deserialize_str(ProjectTemplateVisitor)
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub template: ProjectTemplate,
    pub path: String,
    pub description: String,

    #[serde(
        serialize_with = "serialize_datetime",
        deserialize_with = "deserialize_datetime"
    )]
    pub _createdAt: DateTime<Utc>,
    pub _isActive: bool,
    pub _isRelocateable: bool,
}

fn serialize_datetime<S>(value: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&value.to_rfc3339())
}

fn deserialize_datetime<'de, D>(deserializer: D) -> Result<DateTime<Utc>, D::Error>
where
    D: Deserializer<'de>,
{
    struct DateTimeVisitor;

    impl<'de> DeVisitor<'de> for DateTimeVisitor {
        type Value = DateTime<Utc>;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("struct DateTime<Utc>")
        }

        fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
        where
            E: de::Error,
        {
            match DateTime::parse_from_rfc3339(value) {
                Ok(datetime) => Ok(datetime.to_utc()),
                Err(_) => Err(de::Error::invalid_value(Unexpected::Str(value), &self)),
            }
        }
    }

    deserializer.deserialize_str(DateTimeVisitor)
}

impl Project {
    pub fn new(
        _name: String,
        _template: String,
        _path: String,
        _description: String,
    ) -> Result<Self, &'static str> {
        let check_result = Self::check_values(_name, _template, _path, _description);

        let (name, template, path, description) = match check_result {
            Ok(result) => result,
            Err(msg) => return Err(msg),
        };

        Ok(Self {
            id: Uuid::new_v4().to_string(),
            name,
            template,
            path,
            description,
            _createdAt: Utc::now(),
            _isActive: true,
            _isRelocateable: false,
        })
    }

    fn check_values(
        _name: String,
        _template: String,
        _path: String,
        _description: String,
    ) -> Result<(String, ProjectTemplate, String, String), &'static str> {
        let template: ProjectTemplate;
        let path = PathBuf::from(_path.clone());

        if _name.is_empty() {
            return Err("Not a valid Name value");
        };

        if !path.exists() {
            return Err("Path dosen't exist");
        };

        {
            let template_map = PROJECT_TEMPLATE_MAP.lock();
            let template_result = template_map.get(&_template);
            template = match template_result {
                Some(_template) => *_template,
                None => return Err("Invalid Template"),
            };
        };

        Ok((_name, template.clone(), _path, _description))
    }

    pub fn verify(&self) -> Result<(), &'static str> {
        // TODO: verify Id

        let path = PathBuf::from(self.path.clone());

        if self.name.len() < 1 {
            return Err("Not a valid Name value");
        };

        if !path.exists() {
            return Err("Path dosen't exist");
        };

        Ok(())
    }
}
