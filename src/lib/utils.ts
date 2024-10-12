import { Project } from "./schemas";
import { Command } from "@tauri-apps/api/shell"

export const parsable = <T>(data: T): T => JSON.parse(JSON.stringify(data));
export const classNames = (...classes: (string | boolean)[]) =>
  classes.filter(Boolean).join(" ");
export const time = (time_string: string) => new Date(time_string).getTime();
export const wait = async (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
export const openInVSCode = (project: Project) => new Command('open_vscode', [project.path]).execute();
