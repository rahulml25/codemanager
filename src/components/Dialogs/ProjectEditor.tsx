import { useRef } from "react";
import { Project, projectSchema } from "@/lib/schemas";
import { currentProject, projects } from "@/lib/signals";
// import { type Language, languages } from "@/lib/options";
import templates, { TemplateShow } from "@/lib/options/templates";

import { FaArrowLeftLong } from "react-icons/fa6";
import { invoke } from "@tauri-apps/api";

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
          className="bg-transparent text-3xl outline-none"
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
        <TemplateShow
          name={template.name}
          displayName={template.displayName}
          icon={template.icon}
        />
      </div>
    </>
  );
}
