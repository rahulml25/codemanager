import React from "react";
import {
  NextjsOriginal,
  NodejsOriginal,
  PythonOriginal,
  RustOriginal,
  TypescriptOriginal,
} from "devicons-react";
import { classNames } from "../utils";
import { Language, languages } from ".";
import { AiOutlineCode } from "react-icons/ai";
import type { TemplateKey } from "@/lib/schemas";

export class Template {
  constructor(
    public name: TemplateKey,
    public displayName?: string,
    public icon?: React.FunctionComponent<iconProps>,
    public languages: Language[] = [],
  ) {}
}

const TemplatesConstructor = (
  templates: Template[],
): { [K in Template["name"]]: Template } =>
  Object.assign(
    {},
    ...templates.map((template) => ({ [template.name]: template })),
  );

const templates = TemplatesConstructor([
  new Template("normal", "Normal", AiOutlineCode),
  new Template("python", "Python", PythonOriginal, [languages.Python]),
  new Template("python-sep", "Env: Python", PythonOriginal, [languages.Python]),
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
  className,
  onClick,
}: {
  name: Template["name"];
  displayName: Template["displayName"];
  icon: Template["icon"];
  className?: string;
  onClick?(): void;
}) => (
  <div
    className={classNames(
      "flex items-center gap-1.5 rounded-xl bg-neutral-800 px-2 py-[3px] text-neutral-300 shadow",
      !!className && className,
    )}
    onClick={onClick}
  >
    {!!Icon && <Icon />}
    <span className="max-w-24 truncate text-xs font-semibold">
      {displayName ? displayName : name}
    </span>
  </div>
);

export default templates;
