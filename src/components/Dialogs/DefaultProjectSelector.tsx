import { invoke } from "@tauri-apps/api";
import { time } from "@/lib/utils";

import { Project } from "@/lib/schemas";
import { previousProjectsCatches } from "./ProjectView";
import { currentProject, projects } from "@/lib/signals";
import templates, { TemplateShow } from "@/lib/options/templates";

import { FaArrowLeftLong } from "react-icons/fa6";
import { useSignals } from "@preact/signals-react/runtime";

type Props = {
  project: Project;
  closeInView(): void;
  deletePrevProject(previousProject: Project): void;
};

export default function DefaultProjectSelector({
  project,
  closeInView,
  deletePrevProject: deletePreviousProject,
}: Props) {
  useSignals();
  const template = templates[project.template];

  function makeProjectDefault() {
    invoke<void>("change_defaultProject_onpath", {
      currentDefaultId: currentProject.value!.id,
      newDefaultId: project.id,
      path: project.path,
    }).then(() => {
      const old_defaultProject = currentProject.value!;

      let idx = projects.value.indexOf(old_defaultProject);
      projects.value = projects.value.toSpliced(idx, 1, project);
      currentProject.value = project;

      // updating previousProjectsCatches
      const temp = previousProjectsCatches.value;
      let previousProjects = temp[old_defaultProject.id];
      delete temp[old_defaultProject.id];

      idx = previousProjects.indexOf(project);
      previousProjects.splice(idx, 1, old_defaultProject);

      previousProjectsCatches.value = {
        ...temp,
        [project.id]: previousProjects.toSorted(
          (a, b) => time(a._createdAt) - time(b._createdAt),
        ),
      };

      setTimeout(closeInView, 100);
    });
  }

  return (
    <>
      <div className="text-xm flex justify-between">
        <button
          className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85"
          onClick={() => setTimeout(closeInView, 100)}
        >
          <FaArrowLeftLong />
        </button>

        <button
          className="rounded-md bg-neutral-800 px-2 transition-colors hover:bg-green-700 hover:bg-opacity-85"
          onClick={makeProjectDefault}
        >
          make default
        </button>
      </div>

      <div className="mb-4 border-b-2 border-b-neutral-600 pb-1.5">
        <h1 className="line-clamp-1 text-3xl">{project.name}</h1>
      </div>

      {project.description ? (
        <p>{project.description}</p>
      ) : (
        <p className="text-center text-gray-500">No description</p>
      )}

      <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
        <TemplateShow
          name={template.name}
          displayName={template.displayName}
          icon={template.icon}
        />

        <button
          className="rounded-md bg-red-800 px-2 transition-colors hover:bg-red-600 hover:bg-opacity-85"
          onClick={() => deletePreviousProject(project)}
        >
          Delete
        </button>

        {/* deletePreviousProject */}
      </div>
    </>
  );
}
