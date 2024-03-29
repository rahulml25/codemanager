import React from "react";

import { MdEdit } from "react-icons/md";
import { RiCodeView } from "react-icons/ri";
import { VscRunAbove } from "react-icons/vsc";

import templates, { TemplateShow } from "@/lib/options/templates";
import { currentProject, dialogs, projects } from "@/lib/signals";

type Props = {
  id: Project["_id"];
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
    dialogs.view.value = true;
    const project = projects.value.find((project) => project._id == id);
    if (project) {
      currentProject.value = project;
    }
  }

  return (
    <div className="group rounded-3xl bg-neutral-900 px-4 pb-2.5 pt-2">
      <div className="flex">
        <h3 className="grow pb-2 text-2xl font-semibold">{name}</h3>

        <div className="hidden items-center gap-1 text-sm group-hover:flex">
          <button
            className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85"
            onClick={openProjectView}
          >
            <RiCodeView className="-rotate-45" />
          </button>
          <button className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85">
            <MdEdit />
          </button>
          <button className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85">
            <VscRunAbove />
          </button>
        </div>
      </div>

      <div>
        {!!description && (
          <p className="pb-2 text-sm text-slate-400">{description}</p>
        )}
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
