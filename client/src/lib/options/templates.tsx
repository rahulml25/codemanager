import React from "react";
import {
  NextjsOriginal,
  NodejsOriginal,
  PythonOriginal,
  RustOriginal,
  TypescriptOriginal,
} from "devicons-react";
import { AiOutlineCode } from "react-icons/ai";
import { Language, languages } from ".";
import { TemplateKey } from "@/infer";

export class Template {
  constructor(
    public name: TemplateKey,
    public displayName?: string,
    public icon?: React.FunctionComponent<iconProps>,
    public languages: Language[] = [],
  ) {}
}

const TemplatesContructor = (
  templates: Template[],
): { [K in Template["name"]]: Template } =>
  Object.assign(
    {},
    ...templates.map((template) => ({ [template.name]: template })),
  );

const templates = TemplatesContructor([
  new Template("normal", "Normal", AiOutlineCode),
  new Template("python", "Python", PythonOriginal, [languages.Python]),
  new Template("python_sep", "Env: Python", PythonOriginal, [languages.Python]),
  new Template("nodejs", "Nodejs", NodejsOriginal, [languages.JavaScript]),
  new Template("nodejs-ts", "Nodejs: TypeScript", TypescriptOriginal, [
    languages.TypeScript,
  ]),
  new Template("nextjs", "Nextjs", NextjsOriginal, [
    languages.TypeScript,
    languages.JavaScript,
  ]),
  new Template("rust", "Rust", RustOriginal, [languages.Rust]),
]);

export const TemplateShow = ({
  name,
  displayName,
  icon: Icon,
}: {
  name: Template["name"];
  displayName: Template["displayName"];
  icon: Template["icon"];
}) => (
  <div className="flex items-center gap-1.5 rounded-xl bg-neutral-800 px-2 py-[3px] text-neutral-300">
    {!!Icon && <Icon />}
    <span className="max-w-24 truncate text-xs font-semibold">
      {displayName ? displayName : name}
    </span>
  </div>
);

export default templates;
