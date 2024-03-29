import React from "react";
import { getDBConnector, getProjectsCol } from "@/lib/db";
import { unstable_cache as cache } from "next/cache";
import { parsable } from "@/lib/utils";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProjectsFeed from "@/components/ProjectFeed";
import Dialogs from "@/components/Dialogs";

export const revalidate = 10;

const fetchProjects = cache(
  async function () {
    const client = await getDBConnector();
    const projectsCol = getProjectsCol(client.dbClient);
    const projectsCursor = projectsCol.find();
    const projects = (await projectsCursor.toArray()) as unknown as Project[];

    return parsable(projects);
  },
  ["server-projects"],
  { tags: ["server-projects"], revalidate }
);

export default async function HomePage() {
  const initialProjects = await fetchProjects();

  return (
    <div className="flex">
      <Sidebar />

      <main className="grow">
        <Header />
        <ProjectsFeed initialProjects={initialProjects} />
      </main>

      <Dialogs />
    </div>
  );
}
