import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { signal } from "@preact/signals-core";
import {
  classNames,
  openInVSCode,
  signInWithWebAuthn,
  time,
} from "@/lib/utils";

import { openAskBox } from "./AskBox";
import { Project } from "@/lib/schemas";
import { currentProject, dialogs, projects } from "@/lib/signals";
import { type Language, languages } from "@/lib/options";
import templates, { TemplateShow } from "@/lib/options/templates";

import { MdEdit, MdDelete } from "react-icons/md";
import { VscRunAbove } from "react-icons/vsc";
import { FaChevronDown } from "react-icons/fa6";
import { useSignals } from "@preact/signals-react/runtime";

type Props = {
  openEditMode(): void;
  openInView(project: Project): void;
  deletePrevProject(project: Project): void;
  openRelocatorMode(): void;
};

type PreviousProjectsCatches = { [key: string]: Project[] };
export const previousProjectsCatches = signal<PreviousProjectsCatches>({});

export default function ProjectView({
  openInView,
  openEditMode,
  deletePrevProject,
  openRelocatorMode,
}: Props) {
  useSignals();
  const project = currentProject.value!;
  const template = templates[project.template];
  const [sortedLanguages, setSortedLanguages] = useState<[string, number][]>(
    [],
  );
  const [previousProjects, setPreviousProjects] = useState<Project[]>(
    previousProjectsCatches.value[project.id] ?? [],
  );
  const [measuringCodebase, setMeasuringCodebase] = useState(true);

  async function deleteCurrentProject() {
    const choosenValue = await openAskBox({
      title: "Delete Existing Project",
      contect: "Do you really want to Delete this project?",
      options: [
        { name: "Delete", value: 1, colour: "red" },
        { name: "Cancle", value: 0, colour: "blue" },
      ],
    });
    if (choosenValue !== 1) return;

    const challenge = await signInWithWebAuthn(project.id);
    if (!challenge) return;

    await invoke<AppResponse<boolean, string>>("delete_existing_project", {
      projectId: project.id,
      challenge,
    }).then(() => {
      const idx = projects.value.indexOf(project);
      projects.value = projects.value.toSpliced(idx, 1);

      const temp = previousProjectsCatches.value;
      delete temp[project.id];
      previousProjectsCatches.value = temp;

      currentProject.value = null;
      dialogs.project.value = false;
    });
  }

  useEffect(() => {
    type language_map = { [k: string]: number };

    // Previous Projects at Path
    (async () => {
      if (!!previousProjectsCatches.value[project.id]) return;

      const res = (await invoke("get_previous_projects", {
        currentDefaultId: project.id,
      }).catch((res) => res)) as AppResponse<Project[], string>;

      if (!res.success) return;

      const previousProjects_sorted = res.data.sort(
        (a, b) => time(a._createdAt) - time(b._createdAt),
      );

      previousProjectsCatches.value = {
        ...previousProjectsCatches.value,
        [project.id]: previousProjects_sorted,
      };
      setPreviousProjects(previousProjects_sorted);
    })();

    // Measuring Codebase
    (async () => {
      const res = (await invoke<AppResponse<[language_map, number], string>>(
        "mesure_codebase",
        { projectId: project.id },
      ).catch((res) => res)) as AppResponse<[language_map, number], string>;

      if (!res.success) {
        if (res.data === "Path does not exists") return openRelocatorMode();
        return;
      }

      const [languages, _total_code] = res.data;
      let sorted_languages = Object.entries(languages)
        .sort(([_, a], [, b]) => b - a)
        .slice(0, 3);

      setSortedLanguages(sorted_languages);
      setMeasuringCodebase(false);
    })();
  }, []);

  return (
    <>
      <div className="mb-4 flex justify-between border-b-2 border-b-neutral-600 pb-1.5">
        <h1 className="line-clamp-1 text-3xl font-semibold">{project.name}</h1>

        <div className="flex items-center gap-1 text-sm">
          <button
            className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85"
            onClick={deleteCurrentProject}
          >
            <MdDelete />
          </button>
          <button
            className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85"
            onClick={() => setTimeout(openEditMode, 100)}
          >
            <MdEdit />
          </button>
          <button className="rounded-md bg-neutral-800 p-1 hover:bg-opacity-85">
            <VscRunAbove onClick={() => openInVSCode(project)} />
          </button>
        </div>
      </div>

      <div className="relative h-96 overflow-y-auto">
        {project.description ? (
          <p>{project.description}</p>
        ) : (
          <p className="text-center text-gray-500">No description</p>
        )}
      </div>

      <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
        <TemplateShow
          name={template.name}
          displayName={template.displayName}
          icon={template.icon}
        />

        <div className="relative h-[26px]">
          {!!previousProjects.length && (
            <PreviousProjectsList
              {...{ previousProjects, openInView, deletePrevProject }}
            />
          )}
        </div>

        <div className="flex h-[22px] w-[74px] items-center space-x-2 rounded-full bg-neutral-800 px-2 py-1 shadow">
          {measuringCodebase ? (
            <div className="flex w-full justify-center">
              <LoadingDots />
            </div>
          ) : (
            sortedLanguages.map(([key]) => {
              let Language_icon = ((languages as any)[key] as Language).icon;
              return (
                !!Language_icon && (
                  <Language_icon
                    key={key}
                    className="h-[0.875rem_!important] w-[0.875rem_!important] flex-shrink-0"
                  />
                )
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

function PreviousProjectsList({
  previousProjects: projects,
  openInView,
  deletePrevProject: deletePreviousProject,
}: {
  previousProjects: Project[];
  openInView(project: Project): void;
  deletePrevProject(projectId: Project): void;
}) {
  const [isOpen, setInOpen] = useState(false);

  return (
    <>
      <div
        className={classNames(
          "absolute w-[167.59px] translate-y-[calc(-100%_+_10px)] rounded-t-xl border border-neutral-600/10 bg-sky-200/5 px-1.5 pt-2 backdrop-blur-lg transition-[height]",
          isOpen ? "h-28 pb-2.5" : "h-0 p-0",
        )}
      >
        <div className="h-full w-full space-y-1 overflow-y-scroll rounded-lg pb-1.5 text-sm scrollbar-hide">
          {projects.map((project) => (
            <PreviousProjectItem
              key={project.id}
              projectName={project.name}
              openInView={() => openInView(project)}
              deletePreviousProject={() => deletePreviousProject(project)}
            />
          ))}
        </div>
      </div>

      <button
        className="rounded-full border border-sky-600 bg-sky-900/85 px-3 py-0 backdrop-blur"
        onClick={() => setInOpen((val) => !val)}
      >
        <span className="select-none text-sm">
          <span className="text-sky-300">View:</span> Previous projects
        </span>
      </button>
    </>
  );
}

function PreviousProjectItem({
  projectName,
  openInView,
  deletePreviousProject,
}: {
  projectName: string;
  openInView(): void;
  deletePreviousProject(): void;
}) {
  const [isOpen, setInOpen] = useState(false);

  return (
    <div className="rounded-lg border border-white/5 bg-black/15">
      <div className="flex justify-between px-2 py-0.5">
        <span className="line-clamp-1">{projectName}</span>

        <button
          className="rounded-md text-gray-500 hover:bg-opacity-85"
          onClick={() => setInOpen((val) => !val)}
        >
          <FaChevronDown size={12} />
        </button>
      </div>

      {isOpen && (
        <div className="flex justify-between border-t border-white/5 px-2 py-0.5 font-bold">
          <button
            className="px-0.5 text-red-800 hover:text-red-600"
            onClick={deletePreviousProject}
          >
            Delete
          </button>
          <button
            className="px-0.5 text-blue-700 hover:text-blue-500/95"
            onClick={() => setTimeout(openInView, 100)}
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}

const LoadingDots = () => (
  <div className="flex items-center justify-center space-x-2">
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="h-1 w-1 rounded-full bg-gray-400"
        animate={{ y: ["0%", "-50%", "0%"] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.15,
        }}
      />
    ))}
  </div>
);
