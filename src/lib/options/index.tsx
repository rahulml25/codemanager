import React from "react";
import { SlCalender } from "react-icons/sl";
import { MdOutlineSubtitles } from "react-icons/md";
import {
  // !ActionScript,
  AppleOriginal,
  // !ASP,
  DotNetOriginal /* ASP.NET */,
  // !Assembly (***),

  //
  BashOriginal,
  // !Batch (***),

  //
  COriginal,
  // !C Shell,
  CsharpOriginal,
  CplusplusOriginal,
  CmakeOriginal,
  CoffeescriptOriginal,
  Css3Original,
  // !Cython (***),

  //
  DartOriginal,
  // !Docker ignore,
  DockerOriginal,

  //
  FsharpOriginal,

  // !gitignore (***),
  GoOriginal,
  // !Go Template,
  GradleOriginal,
  GraphqlPlain,

  //
  Html5Original,

  // !ignore,

  //
  JavaOriginal,
  JavascriptOriginal,
  // !JavaServer Pages,
  // !Jinja (***),
  JsonOriginal,
  // !JSX (***),
  JupyterOriginal,

  //
  KotlinOriginal,

  // !License,

  // !Makefile (***),
  MarkdownOriginal,
  VisualstudioOriginal /* MSBuild */,

  //
  ObjectivecPlain /*
    Objective C
    Objective C++ */,

  //
  PerlOriginal,
  PhpOriginal,
  // !Pkl,
  // !PL/SQL,
  // !Plain Text (***),
  PowershellOriginal,
  PythonOriginal,

  //
  ROriginal,
  RubyOriginal,
  // !Ruby HTML,
  RustOriginal,

  // !Shell (***),
  SassOriginal,
  SqliteOriginal,
  SvelteOriginal,
  // !SVG (***),
  SwiftOriginal,
  // x !Systemd,

  // !TOML,
  TypescriptOriginal /*
    TypeScript
    TypeScript Typings */,

  //
  UnrealengineOriginal,

  //
  VimOriginal,
  VisualbasicOriginal /*
    Visual Basic
    Visual Basic for Applications */,
  VuejsOriginal,

  //
  XamarinOriginal /* XAML */,
  XcodeOriginal,
  XmlOriginal /*
    XML
    XML Schema */,

  //
  YamlOriginal,
  YarnOriginal,

  // !Zsh (***),
} from "devicons-react";

export class Language {
  constructor(
    public name: string,
    public displayName?: string,
    public icon?: React.FunctionComponent<iconProps>,
  ) {}
}

export const sorts = [
  {
    name: "date",
    displayName: "Date",
    Icon: ({ key }: { key?: React.Key }) => (
      <SlCalender key={key} className="h-4 w-4 flex-shrink-0" />
    ),
  },
  {
    name: "name",
    displayName: "Name",
    Icon: ({ key }: { key?: React.Key }) => (
      <MdOutlineSubtitles key={key} className="-mx-0.5 h-5 w-5 flex-shrink-0" />
    ),
  },
];

export const languages = {
  Python: new Language("python", "Python", PythonOriginal),
  Go: new Language("go", "Go", GoOriginal),
  JavaScript: new Language("javascript", "JavaScript", JavascriptOriginal),
  TypeScript: new Language("typescript", "TypeScript", TypescriptOriginal),
  Rust: new Language("rust", "Rust", RustOriginal),
  Dart: new Language("dart", "Dart", DartOriginal),
  "C#": new Language("c-sharp", "C#", CsharpOriginal),
  Java: new Language("java", "Java", JavaOriginal),
  C: new Language("c", "C", COriginal),
  "C++": new Language("cpp", "C++", CplusplusOriginal),

  // Extended
  AppleScript: new Language("applescript", "AppleScript", AppleOriginal),
  "ASP.NET": new Language("asp-dotnet", "ASP.NET", DotNetOriginal),

  //
  BASH: new Language("bash", "Bash", BashOriginal),

  //
  CMake: new Language("cmake", "CMake", CmakeOriginal),
  CoffeeScript: new Language(
    "coffeescript",
    "CoffeeScript",
    CoffeescriptOriginal,
  ),
  CSS: new Language("css", "CSS", Css3Original),

  //
  Dockerfile: new Language("dockerfile", "Dockerfile", DockerOriginal),

  //
  "F#": new Language("f-sharp", "F#", FsharpOriginal),

  //
  Gradle: new Language("gradle", "Gradle", GradleOriginal),
  GraphQL: new Language("graphql", "GraphQL", GraphqlPlain),

  //
  HTML: new Language("html", "HTML", Html5Original),

  //
  JSON: new Language("json", "JSON", JsonOriginal),
  Jupyter: new Language("jupyter", "Jupyter", JupyterOriginal),

  //
  Kotlin: new Language("kotlin", "Kotlin", KotlinOriginal),

  //
  Markdown: new Language("markdown", "Markdown", MarkdownOriginal),
  MSBuild: new Language("ms-build", "MSBuild", VisualstudioOriginal),

  //
  "Objective C": new Language("obj-c", "Objective C", ObjectivecPlain),
  "Objective C++": new Language("obj-c++", "Objective C++", ObjectivecPlain),

  //
  Perl: new Language("perl", "Perl", PerlOriginal),
  PHP: new Language("php", "PHP", PhpOriginal),
  PowerShell: new Language("powershell", "PowerShell", PowershellOriginal),

  //
  R: new Language("r", "R", ROriginal),
  Ruby: new Language("ruby", "Ruby", RubyOriginal),

  //
  Shell: new Language("shell", "Shell", BashOriginal),
  Sass: new Language("sass", "Sass", SassOriginal),
  SQL: new Language("sql", "SQL", SqliteOriginal),
  Svelte: new Language("svelte", "Svelte", SvelteOriginal),
  Swift: new Language("swift", "Swift", SwiftOriginal),

  //
  "Unreal Script": new Language(
    "unreal-script",
    "Unreal Script",
    UnrealengineOriginal,
  ),

  //
  "Vim Script": new Language("vim-script", "Vim Script", VimOriginal),
  "Visual Basic": new Language(
    "visual-basic",
    "Visual Basic",
    VisualbasicOriginal,
  ),
  Vue: new Language("vue", "Vue", VuejsOriginal),

  //
  XAML: new Language("xaml", "XAML", XamarinOriginal),
  "Xcode Config": new Language("xcode-config", "Xcode Config", XcodeOriginal),
  XML: new Language("xml", "XML", XmlOriginal),

  //
  YAML: new Language("yaml", "YAML", YamlOriginal),
  Yarn: new Language("yarn", "Yarn", YarnOriginal),
};

// CMD: .\scc "C:\Code\Python\Playground\AsyncDL" -f json
/* Format:
{
  "languageSummary": [
    {
      "Name": "Python",
      "Bytes": 3973,
      "CodeBytes": 0,
      "Lines": 146,
      "Code": 96,
      "Comment": 19,
      "Blank": 31,
      "Complexity": 5,
      "Count": 2,
      "WeightedComplexity": 0,
      "Files": [],
      "LineLength": null
    }
  ],
  "estimatedCost": 2357.125496820469,
  "estimatedScheduleMonths": 1.3801283743644246,
  "estimatedPeople": 0.1517326827204878
}
*/
// @ts-ignore
