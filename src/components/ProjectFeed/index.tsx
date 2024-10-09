import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { filters, projects } from "@/lib/signals";
import { useSignals } from "@preact/signals-react/runtime";

import ProjectCard from "./ProjectCard";

import type { Project } from "@/lib/schemas";
import templates from "@/lib/options/templates";

type Props = {};

export default function ProjectsFeed({}: Props) {
  useSignals();

  const [localProjects, setProjectsFeed] = useState<Project[]>([]);

  async function fetchProjects() {
    const fetchedProjects = await invoke<Project[]>("get_projects");
    projects.value = fetchedProjects;
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => setProjectsFeed(projects.value), [projects.value]);

  function filterProjects() {
    let finalProjects = localProjects.filter(
      (project) =>
        project.name
          .toLowerCase()
          .includes(filters.search.value.toLowerCase()) ||
        project.description
          ?.toLowerCase()
          .includes(filters.search.value.toLowerCase()),
    );

    if (filters.sortBy.value.name == "name") {
      finalProjects.sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
      );
    } else {
      finalProjects.sort(
        (a, b) => Date.parse(b._createdAt) - Date.parse(a._createdAt),
      );
    }

    if (filters.language.value !== null) {
      const language = filters.language.value;
      finalProjects = finalProjects.filter((project) =>
        templates[project.template].languages.includes(language),
      );
    }

    if (filters.template.value !== null) {
      const template = filters.template.value;
      finalProjects = finalProjects.filter(
        (project) => project.template === template.name,
      );
    }

    return finalProjects;
  }

  const projectsFeed = useMemo(
    filterProjects,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      localProjects,
      filters.sortBy.value,
      filters.search.value,
      filters.language.value,
      filters.template.value,
    ],
  );

  return (
    <div className="mr-1.5 grow px-5 py-4">
      {projectsFeed.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {projectsFeed.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              template={project.template}
              description={project.description}
            />
          ))}
        </div>
      ) : (
        <div className="grid h-full items-center">
          <p className="mb-20 text-center text-xl text-white/60">
            No Projects yet
          </p>
        </div>
      )}
    </div>
  );
}
