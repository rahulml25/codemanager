import React from "react";
import ProjectView from "./ProjectView";
import ProjectEditor from "./ProjectEditor";
import { dialogs } from "@/lib/signals";
import { classNames } from "@/lib/utils";
import { useSignals } from "@preact/signals-react/runtime";

type Props = {};

export default function Dialogs({}: Props) {
  useSignals();

  const isDialogOpen = dialogs.editor.value || dialogs.view.value;

  return (
    <div
      className={classNames(
        isDialogOpen ? "flex" : "hidden",
        "bg-black-50/5 absolute bottom-0 left-0 right-0 top-0 items-center bg-blend-saturation backdrop-blur-[1px]"
      )}
    >
      {dialogs.view.value && <ProjectView />}
      {dialogs.editor.value && <ProjectEditor />}
    </div>
  );
}
