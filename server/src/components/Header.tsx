"use client";
import React from "react";
import { parsable } from "@/lib/utils";
import { filters, projects } from "@/lib/signals";
import { useSignals } from "@preact/signals-react/runtime";

import { FiRefreshCw } from "react-icons/fi";

type Props = {};

export default function Header({}: Props) {
  async function fetchProjects() {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const newProjects = await res.json();
      const resBody = parsable(newProjects);
      if (resBody.success) {
        projects.value = resBody.data;
      }
    }
  }

  return (
    <header className="flex py-2">
      <SearchBar />

      <div className="relative">
        <button
          className="absolute right-0 flex items-center gap-2 rounded-2xl bg-neutral-800/85 px-4 py-1.5 text-neutral-200 hover:bg-opacity-80"
          onClick={fetchProjects}
        >
          <span>Refresh</span>
          <FiRefreshCw />
        </button>
      </div>
    </header>
  );
}

function SearchBar() {
  useSignals();
  return (
    <div className="mx-auto w-fit rounded-3xl bg-neutral-800 px-4 py-2">
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
