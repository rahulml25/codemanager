import templates, { TemplateShow } from "@/lib/options/templates";
import { currentProject } from "@/lib/signals";
import React from "react";

type Props = {};

export default function ProjectView({}: Props) {
  const project = currentProject.value!;
  const template = templates[project.template];

  return (
    <div className="relative mx-auto h-[calc(100dvh_-_40px)] max-h-[600px] w-[calc(100dvw_-_40px)] max-w-[600px] rounded-3xl border-2 border-neutral-800 bg-[#161616]/95 px-6 py-4 shadow-md">
      <h1 className="mb-4 border-b-2 border-b-neutral-600 pb-1.5 text-3xl">
        ProjectView
      </h1>

      <p>
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Amet minima
        suscipit modi alias quia repellat velit voluptates impedit officia
        similique! Quis, excepturi beatae! Animi consequatur molestias sit
        corporis ducimus fugit eaque quam ex, quod quisquam quas voluptatibus,
        praesentium eveniet aspernatur architecto assumenda voluptatem neque
        culpa explicabo magni ut! Eligendi odit earum deleniti.
      </p>

      <div className="absolute bottom-5 left-6 right-6 flex justify-between items-center">
        <TemplateShow
          name={template.name}
          displayName={template.displayName}
          icon={template.icon}
        />

        <div className="h-2 w-2 bg-red-500"></div>
      </div>
    </div>
  );
}
