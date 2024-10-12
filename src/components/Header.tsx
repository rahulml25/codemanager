import { useState } from "react";
import { classNames } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/tauri";
import { filters, projects } from "@/lib/signals";
import { useSignals } from "@preact/signals-react/runtime";

import { FiRefreshCw } from "react-icons/fi";
import type { Project } from "@/lib/schemas";

type Props = {};

export default function Header({}: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function fetchProjects() {
    setIsRefreshing(true);
    const fetchedProjects: Project[] = await invoke("get_projects");
    projects.value = fetchedProjects;
    setIsRefreshing(false);
  }

  return (
    <header className="sticky top-0 z-[5] mr-1.5 flex py-2">
      <SearchBar />

      <div className="relative">
        <button
          className="absolute right-0 flex items-center gap-2 rounded-2xl bg-neutral-800/85 px-4 py-1.5 text-neutral-200 shadow-lg hover:bg-opacity-80"
          onClick={fetchProjects}
        >
          <span>Refresh</span>
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
