import React from "react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Dialogs from "@/components/Dialogs";
import ProjectsFeed from "@/components/ProjectFeed";

export default function HomePage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="grow">
        <Header />
        <ProjectsFeed />
      </main>

      <Dialogs />
    </div>
  );
}
