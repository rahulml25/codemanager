use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    pub static ref SUPPORTED_LANGUAGES: HashMap<&'static str, bool> = HashMap::from([
        ("Python", true),
        ("Go", true),
        ("JavaScript", true),
        ("TypeScript", true),
        ("Rust", true),
        ("Dart", true),
        ("C", true),
        ("Java", true),
        ("C", true),
        ("C++", true),
        ("AppleScript", true),
        ("ASP.NET", true),
        ("BASH", true),
        ("CMake", true),
        ("CoffeeScript", true),
        ("CSS", true),
        ("Dockerfile", true),
        ("F#", true),
        ("Gradle", true),
        ("GraphQL", true),
        ("HTML", true),
        ("JSON", true),
        ("Jupyter", true),
        ("Kotlin", true),
        ("Markdown", true),
        ("MSBuild", true),
        ("Objective C", true),
        ("Objective C++", true),
        ("Perl", true),
        ("PHP", true),
        ("PowerShell", true),
        ("R", true),
        ("Ruby", true),
        ("Shell", true),
        ("Sass", true),
        ("SQL", true),
        ("Svelte", true),
        ("Swift", true),
        ("Unreal Script", true),
        ("Vim Script", true),
        ("Visual Basic", true),
        ("Vue", true),
        ("XAML", true),
        ("Xcode Config", true),
        ("XML", true),
        ("YAML", true),
        ("Yarn", true),

        // Additional
        ("TypeScript Typings", true),
        ("ASP", true),
        ("C Shell", true),
        ("Jinja", true),
        ("Docker ignore", true),
        ("Go Template", true),
        ("JavaServer Pages", true),
        ("JSX", true),
        ("Objective C++", true),
        ("Ruby Html", true),
        ("Visual Basic for Applications", true),
        ("XML Schema", true),
    ]);
    pub static ref MULTIPART_LANGUAGES: Vec<Vec<&'static str>> = vec![
        vec!["TypeScript", "TypeScript Typings"],
        vec!["ASP.NET", "ASP"],
        vec!["C", "C Shell"],
        vec!["Python", "Jinja"],
        vec!["Dockerfile", "Docker ignore"],
        vec!["Go", "Go Template"],
        vec!["Java", "JavaServer Pages"],
        vec!["JavaScript", "JSX"],
        vec!["Objective C", "Objective C++"],
        vec!["Ruby", "Ruby Html"],
        vec!["Visual Basic", "Visual Basic for Applications"],
        vec!["XML", "XML Schema"],
    ];
    pub static ref GROUPED_LANGUAGES_MAP: HashMap<&'static str, usize> = MULTIPART_LANGUAGES
        .clone()
        .into_iter()
        .enumerate()
        .map(|(idx, lang_group)| lang_group.into_iter().map(move |lang| (lang, idx)))
        .flatten()
        .collect();
}
