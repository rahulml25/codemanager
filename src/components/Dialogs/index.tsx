import { useEffect, useRef, useState } from "react";
import { Project } from "@/lib/schemas";
import { invoke } from "@tauri-apps/api";
import { classNames } from "@/lib/utils";
import { currentProject, dialogs } from "@/lib/signals";
import { useSignals } from "@preact/signals-react/runtime";

import ProjectEditor from "./ProjectEditor";
import { titlebarElement } from "../Titlebar";
import ProjectRelocator from "./ProjectRelocator";
import AskBoxDialog, { openAskBox } from "./AskBox";
import ProjectView, { previousProjectsCatches } from "./ProjectView";
import DefaultProjectSelector from "./DefaultProjectSelector";

type Props = {};

export default function Dialogs({}: Props) {
  useSignals();
  const isDialogOpen = dialogs.project.value || dialogs.askBox.value;

  return (
    <div
      className={classNames(
        isDialogOpen ? "flex" : "hidden",
        "bg-black-50/5 absolute bottom-0 left-0 right-0 top-0 z-10 items-center bg-blend-saturation backdrop-blur-[1px]",
      )}
    >
      {currentProject.value !== null && dialogs.project.value && (
        <ProjectDialogBase />
      )}
      {dialogs.askBox.value && <AskBoxDialog />}
    </div>
  );
}

type DialogMode = "view" | "editor" | "relocator";

function ProjectDialogBase({}: {}) {
  useSignals();
  const divRef = useRef<HTMLDivElement>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(() =>
    !currentProject.value!._isRelocateable ? "view" : "relocator",
  );
  const [previousProject, setPreviousProject] = useState<Project | null>(null);

  function openEditMode() {
    setDialogMode("editor");
  }

  function closeEditMode() {
    setDialogMode("view");
  }

  function openRelocatorMode() {
    setDialogMode("relocator");
  }

  function closeRelocatorMode() {
    setDialogMode("view");
  }

  function openInView(project: Project) {
    setDialogMode("view");
    setPreviousProject(project);
  }

  function closeInView() {
    setDialogMode("view");
    setPreviousProject(null);
  }

  async function deletePreviousProject(previousProject: Project) {
    const choosenValue = await openAskBox({
      title: "Delete Previous Project",
      contect: "Do you really want to Delete this project?",
      options: [
        { name: "Delete", value: 1, colour: "red" },
        { name: "Cancle", value: 0, colour: "blue" },
      ],
    });

    if (choosenValue === 1) {
      const currentDefaultId = currentProject.value!.id;
      invoke<AppResponse<boolean, string>>("delete_previousProject_onpath", {
        currentDefaultId,
        previousProjectId: previousProject.id,
        path: previousProject.path,
      }).then(() => {
        const temp = previousProjectsCatches.value;
        const previousProjects = temp[currentDefaultId];
        const idx = previousProjects.indexOf(previousProject);
        previousProjects.splice(idx, 1);
        previousProjectsCatches.value = {
          ...temp,
          [currentDefaultId]: previousProjects,
        };

        console.log("Project Deleted successfully");
      });
    }
  }

  function handleClickOutside(event: any) {
    // console.log(event.target);
    // console.log(divRef.current?.contains(event.target));

    if (
      !dialogs.askBox.value &&
      divRef.current &&
      !divRef.current.contains(event.target) &&
      !titlebarElement?.contains(event.target)
    ) {
      dialogs.project.value = false;
    } else {
      /* clicked inside */
    }
  }

  useEffect(() => {
    setTimeout(
      () => document.addEventListener("click", handleClickOutside),
      300,
    );

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative mx-auto h-[calc(100dvh_-_2px_-_28px_-_40px)] max-h-[600px] w-[calc(100dvw_-_240px_-_40px)] max-w-[600px] rounded-3xl border-2 border-neutral-800 bg-[#161616]/95 px-6 py-4 shadow-md"
      ref={divRef}
    >
      {dialogMode == "view" &&
        (previousProject == null ? (
          <ProjectView
            {...{ openEditMode, openInView, openRelocatorMode }}
            deletePrevProject={deletePreviousProject}
          />
        ) : (
          <DefaultProjectSelector
            closeInView={closeInView}
            project={previousProject}
            deletePrevProject={deletePreviousProject}
          />
        ))}
      {dialogMode == "editor" && (
        <ProjectEditor closeEditMode={closeEditMode} />
      )}
      {dialogMode == "relocator" && (
        <ProjectRelocator {...{ closeRelocatorMode }} />
      )}
    </div>
  );
}
