import React, { useRef, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { Project, projectSchema } from "@/lib/schemas";
import { currentProject, projects } from "@/lib/signals";
import templates, { TemplateShow, Template } from "@/lib/options/templates";

import { FaArrowLeftLong } from "react-icons/fa6";

type Props = {
  closeEditMode(): void;
};

export default function ProjectEditor({ closeEditMode }: Props) {
  const project = currentProject.value!;
  const template = templates[project.template];
  const projectUpdate = useRef({
    name: project.name,
    template: project.template,
    description: project.description,
  });

  function saveProject() {
    let updatedProject: Project = {
      ...project,
      ...projectUpdate.current,
    };

    const parseRes = projectSchema.safeParse(updatedProject);

    if (!parseRes.success) {
      return console.error(parseRes.error.message);
    }

    invoke<void>("update_project", { project: updatedProject })
      .then(() => {
        const idx = projects.value.indexOf(project);
        projects.value = projects.value.toSpliced(idx, 1, updatedProject);
        currentProject.value = updatedProject;
      })
      .catch(console.error);
  }

  return (
    <>
      <div className="text-xm flex justify-between">
        <button
          className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85"
          onClick={() => setTimeout(closeEditMode, 100)}
        >
          <FaArrowLeftLong />
        </button>

        <button
          className="rounded-md bg-neutral-800 px-2 transition-colors hover:bg-blue-800 hover:bg-opacity-85"
          onClick={saveProject}
        >
          Save
        </button>
      </div>

      <div className="mb-4 border-b-2 border-b-neutral-600 pb-1.5">
        <input
          type="text"
          name="name"
          className="w-full bg-transparent text-3xl font-semibold outline-none"
          defaultValue={project.name}
          onChange={(e) =>
            (projectUpdate.current = {
              ...projectUpdate.current,
              name: e.currentTarget.value,
            })
          }
        />
      </div>

      <textarea
        name="description"
        className="h-96 w-full resize-none bg-transparent placeholder-gray-500 outline-none"
        placeholder="No description"
        defaultValue={project.description}
        onChange={(e) =>
          (projectUpdate.current = {
            ...projectUpdate.current,
            description: e.currentTarget.value,
          })
        }
      />

      <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
        <TemplateSelector
          defaultTemplate={template}
          projectUpdate={projectUpdate}
        />
      </div>
    </>
  );
}

type TemplateSelectorProps = {
  defaultTemplate: Template;
  projectUpdate: React.MutableRefObject<{
    template: Project["template"];
  }>;
};

function TemplateSelector({
  defaultTemplate,
  projectUpdate,
}: TemplateSelectorProps) {
  const [template, setTemplate] = useState(defaultTemplate);
  const [isOpen, setIsOpen] = useState(false);

  function handleTemplateSelect(template: Template) {
    setTemplate(template);
    projectUpdate.current.template = template.name;
    setTimeout(() => setIsOpen(false), 100);
  }

  return (
    <>
      {isOpen ? (
        <div className="cursor-pointer rounded-xl border border-neutral-800 bg-neutral-800 shadow-lg">
          {Object.values(templates).map((template) => (
            <TemplateShow
              key={template.name}
              name={template.name}
              displayName={template.displayName}
              icon={template.icon}
              className="shadow-none transition-colors hover:bg-black/10"
              onClick={() => handleTemplateSelect(template)}
            />
          ))}
        </div>
      ) : (
        <span
          onClick={() => setTimeout(() => setIsOpen(true), 100)}
          className="cursor-pointer"
        >
          <TemplateShow
            name={template.name}
            displayName={template.displayName}
            icon={template.icon}
          />
        </span>
      )}
    </>
  );
}
