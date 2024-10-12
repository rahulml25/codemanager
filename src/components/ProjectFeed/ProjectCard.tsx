import { RiCodeView } from "react-icons/ri";
import { VscRunAbove } from "react-icons/vsc";

import templates, { TemplateShow } from "@/lib/options/templates";
import { currentProject, dialogs, projects } from "@/lib/signals";
import type { Project } from "@/lib/schemas";
import { classNames, openInVSCode } from "@/lib/utils";

type Props = {
  id: Project["id"];
  name: Project["name"];
  description: Project["description"];
  template: Project["template"];
};

export default function ProjectCard({
  id,
  name,
  description,
  template,
}: Props) {
  function openProjectView() {
    dialogs.project.value = true;
    const project = projects.value.find((project) => project.id == id);
    if (project) {
      currentProject.value = project;
    }
  }

  function handleOpenInVSCode() {
    const project = projects.value.find((project) => project.id == id);
    if (project) return openInVSCode(project);
  }

  return (
    <div className="group rounded-2xl bg-neutral-900 px-4 pb-3 pt-2">
      <div className="flex">
        <h3 className="line-clamp-1 grow pb-2 text-2xl font-semibold">
          {name}
        </h3>

        <div className="hidden w-12 items-center gap-1 text-sm group-hover:flex">
          <button
            className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85"
            onClick={openProjectView}
          >
            <RiCodeView className="-rotate-45" />
          </button>
          <button className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85">
            <VscRunAbove onClick={handleOpenInVSCode} />
          </button>
        </div>
      </div>

      <div
        className={classNames(
          "h-10",
          !description && "flex items-center justify-center",
        )}
      >
        <p
          className={classNames(
            "mb-2 line-clamp-2 text-sm",
            !description ? "select-none text-gray-600" : "text-slate-400",
          )}
        >
          {!!description ? description : ". . ."}
        </p>
      </div>

      <div className="flex pt-1">
        <TemplateShow
          name={templates[template].name}
          displayName={templates[template].displayName}
          icon={templates[template].icon}
        />
      </div>
    </div>
  );
}
