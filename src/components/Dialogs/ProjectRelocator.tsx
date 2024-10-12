// import { useState } from "react";
// import { Project } from "@/lib/schemas";
import { invoke, dialog } from "@tauri-apps/api";
import { currentProject, projects } from "@/lib/signals";
import { useSignals } from "@preact/signals-react/runtime";
// import templates, { TemplateShow } from "@/lib/options/templates";

type Props = {
  closeRelocatorMode(): void;
};

export default function ProjectRelocator({ closeRelocatorMode }: Props) {
  useSignals();
  const project = currentProject.value!;
  // const template = templates[project.template];

  const handleRelocate = async () => {
    // Visit Help: https://v1.tauri.app/v1/api/js/dialog/#open
    const newPath = await dialog
      .open({ directory: true, multiple: false })
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
      _isRelocateable: false,
    };

    const temp = projects.value;
    const idx = temp.indexOf(project);
    temp[idx] = newCurrentProject;
    projects.value = temp;
    currentProject.value = newCurrentProject;

    closeRelocatorMode();
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl">Relocate Project</h2>

      <div className="flex justify-end gap-2">
        <button
          className="rounded bg-neutral-700 px-4 py-2 hover:bg-neutral-600"
          onClick={closeRelocatorMode}
        >
          Cancel
        </button>
        <button
          className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500"
          onClick={handleRelocate}
        >
          Relocate
        </button>
      </div>
    </div>
  );
}
