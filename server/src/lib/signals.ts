import { signal } from "@preact/signals-core";
import { Language, sorts } from "./options";
import { Template } from "./options/templates";

export const projects = signal<Project[]>([]);
export const currentProject = signal<Project | null>(null);

export const filters = {
  search: signal<string>(""),
  sortBy: signal<Option>(sorts[0]),
  language: signal<Language | null>(null),
  template: signal<Template | null>(null),
};

export const dialogs = {
  view: signal<boolean>(false),
  editor: signal<boolean>(false),
};
