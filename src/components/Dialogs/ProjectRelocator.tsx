import { useEffect } from "react";
import { openAskBox } from "./AskBox";
import { Project } from "@/lib/schemas";
import { invoke, dialog } from "@tauri-apps/api";
import { previousProjectsCatches } from "./ProjectView";
import { useSignals } from "@preact/signals-react/runtime";
import { currentProject, projects, dialogs } from "@/lib/signals";
import templates, { TemplateShow } from "@/lib/options/templates";

type Props = {
  closeRelocatorMode(): void;
};

export default function ProjectRelocator({ closeRelocatorMode }: Props) {
  useSignals();
  const project = currentProject.value!;
  const template = templates[project.template];

  const handleRelocate = async () => {
    // Visit Help: https://v1.tauri.app/v1/api/js/dialog/#open
    const newPath = await dialog
      .open({ directory: true, multiple: false, defaultPath: project.path })
      .then((res) => (Array.isArray(res) ? res[0] : res));
    if (newPath == null) return;

    const res = await invoke<AppResponse<boolean, string>>("relocate_project", {
      projectId: project.id,
      newPath,
    });
    if (!res.success) return;

    const newCurrentProject = {
      ...project,
      path: newPath,
      _isRelocatable: false,
    };

    const temp = projects.value;
    const idx = temp.indexOf(project);
    temp[idx] = newCurrentProject;
    projects.value = temp;
    currentProject.value = newCurrentProject;

    closeRelocatorMode();
  };

  async function deleteRelocatableProject() {
    const choosenValue = await openAskBox({
      title: "Delete Missing Project",
      contect: "Do you really want to Delete this project?",
      options: [
        { name: "Delete", value: 1, colour: "red" },
        { name: "Cancle", value: 0, colour: "blue" },
      ],
    });

    if (choosenValue !== 1) return;

    invoke<AppResponse<boolean, string>>("delete_relocatable_project", {
      projectId: project.id,
    }).then(() => {
      const idx = projects.value.indexOf(project);
      projects.value = projects.value.toSpliced(idx, 1);

      const temp = previousProjectsCatches.value;
      delete temp[project.id];
      previousProjectsCatches.value = temp;

      closeRelocatorMode();
      currentProject.value = null;
      dialogs.project.value = false;
    });
  }

  useEffect(() => {
    invoke<AppResponse<boolean, string>>("check_relocatable_existance", {
      projectId: project.id,
    }).then((res) => {
      if (!res.success || res.data !== true) return;

      const newProject: Project = {
        ...project,
        _isRelocatable: false,
      };

      const idx = projects.value.indexOf(project);
      projects.value = projects.value.toSpliced(idx, 1, newProject);
      currentProject.value = newProject;

      closeRelocatorMode();
    });
  });

  return (
    <>
      <div className="mb-4 flex justify-between border-b-2 border-b-neutral-600 pb-1.5">
        <h1 className="line-clamp-1 text-3xl font-semibold">{project.name}</h1>
      </div>

      <div className="relative h-96 overflow-y-hidden">
        {project.description ? (
          <p>{project.description}</p>
        ) : (
          <p className="text-center text-gray-500">No description</p>
        )}

        <div className="absolute top-0 flex h-full w-full flex-col items-center justify-center rounded-md bg-black/5 p-4 backdrop-blur-sm">
          <div>
            <h2 className="mx-auto mb-8 text-center text-gray-300">
              <span className="text-center">
                Can't find the Project directory,
              </span>
              <br />
              <span className="text-center">
                <strong>Relocate</strong> it, or{" "}
                <strong className="text-red-700">Remove</strong> it.
              </span>
            </h2>

            <div className="flex justify-center gap-14">
              <button
                className="rounded bg-neutral-700 px-3 py-1 transition-colors hover:bg-red-700"
                onClick={deleteRelocatableProject}
              >
                Remove
              </button>
              <button
                className="rounded bg-blue-600 px-3 py-1 hover:bg-blue-500"
                onClick={handleRelocate}
              >
                Relocate
              </button>
            </div>
          </div>
        </div>
      </div>

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
