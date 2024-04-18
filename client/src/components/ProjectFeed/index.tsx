import React, { useEffect, useMemo, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import ProjectCard from "./ProjectCard";

import templates from "@/lib/options/templates";
import { filters, projects } from "@/lib/signals";
import { Project } from "@/infer";
import { SERVER_URL } from "@/../../tslib/config";
import { parsable } from "@/lib/utils";

type Props = {};

export default function ProjectsFeed({}: Props) {
  useSignals();

  const [localProjects, setProjectsFeed] = useState<Project[]>([]);

  async function fetchProjects() {
    const res = await fetch(`${SERVER_URL}/projects`).catch(() => null);
    if (res && res.ok) {
      const newProjects = await res.json();

      const resBody = parsable(newProjects);
      if (resBody.success) {
        projects.value = resBody.data;
      }
    }
  }

  useEffect(() => {
    console.log(SERVER_URL);

    fetchProjects();
  }, []);

  useEffect(
    () => {
      setProjectsFeed(projects.value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects.value]
  );

  function filterProjects() {
    let finalProjects = localProjects.filter(
      (project) =>
        project.name.includes(filters.search.value) ||
        project.description?.includes(filters.search.value)
    );

    if (filters.sortBy.value.name == "name") {
      finalProjects.sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0
      );
    } else {
      finalProjects.sort(
        (a, b) => Date.parse(b._createdAt) - Date.parse(a._createdAt)
      );
    }

    if (filters.language.value !== null) {
      const language = filters.language.value;
      finalProjects = finalProjects.filter((project) =>
        templates[project.template].languages.includes(language)
      );
    }

    if (filters.template.value !== null) {
      const template = filters.template.value;
      finalProjects = finalProjects.filter(
        (project) => project.template === template.name
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
    ]
  );

  return (
    <div className="grid grid-cols-3 gap-2 px-5 py-4">
      {projectsFeed.map((project) => (
        <ProjectCard
          key={project._id}
          id={project._id}
          name={project.name}
          template={project.template}
          description={project.description}
        />
      ))}
    </div>
  );
}
