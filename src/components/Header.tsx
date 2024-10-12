import { useState } from "react";
import { Project } from "@/lib/schemas";
import { filters, projects } from "@/lib/signals";
import { invoke, dialog } from "@tauri-apps/api";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { classNames, fetchProjects } from "@/lib/utils";
import { useSignals } from "@preact/signals-react/runtime";

type Props = {};

export default function Header({}: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function _fetchProjects() {
    setIsRefreshing(true);
    await fetchProjects();
    setIsRefreshing(false);
  }

  async function importExistingProject() {
    const projectPath = await dialog
      .open({ directory: true, multiple: false })
      .then((res) => (Array.isArray(res) ? res[0] : res));
    if (projectPath == null) return;

    const seperator = projectPath.includes("/") ? "/" : "\\";
    const directory_name = projectPath.split(seperator).reverse()[0];

    // TODO: Repair defaults
    const res = await invoke<AppResponse<Project, string>>("create_project", {
      name: directory_name,
      template: "normal",
      path: projectPath,
      description: "",
    }).then((res) => res);
    if (!res.success) return;

    projects.value = [...projects.value, res.data];
  }

  return (
    <header className="sticky top-0 z-[5] mr-1.5 flex py-2">
      <SearchBar />

      <div className="relative flex items-center">
        <button
          className="group/button absolute right-[106px] flex h-8 items-center gap-2 rounded-xl bg-neutral-800/85 px-2.5 py-1.5 text-neutral-200 shadow-lg hover:scale-105 hover:bg-opacity-80"
          onClick={importExistingProject}
        >
          <FiPlus />
        </button>
        <button
          className="group-button absolute right-0 flex items-center gap-2 rounded-2xl bg-neutral-800/85 px-4 py-1.5 text-neutral-200 shadow-lg hover:bg-opacity-80"
          onClick={_fetchProjects}
        >
          <span className="text-sm">Refresh</span>
          <FiRefreshCw className={classNames(isRefreshing && "animate-spin")} />
        </button>
      </div>
    </header>
  );
}

function SearchBar() {
  useSignals();
  return (
    <div className="mx-auto w-fit rounded-3xl border border-neutral-700/40 bg-neutral-800 px-4 py-[calc(0.5rem-1px)] shadow-lg">
      <input
        type="text"
        placeholder="Search..."
        className="w-48 bg-transparent outline-none transition-all duration-200 focus:w-96"
        value={filters.search.value}
        onChange={(e) => (filters.search.value = e.target.value)}
      />
    </div>
  );
}
