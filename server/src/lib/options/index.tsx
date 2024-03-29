import React from "react";
import { SlCalender } from "react-icons/sl";
import { MdOutlineSubtitles } from "react-icons/md";
import {
  COriginal,
  CplusplusOriginal,
  CsharpOriginal,
  DartOriginal,
  GoOriginal,
  JavaOriginal,
  JavascriptOriginal,
  PythonOriginal,
  RustOriginal,
  TypescriptOriginal,
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
  "C++": new Language("cpp", "C++", CplusplusOriginal),
  C: new Language("c", "C", COriginal),
};
