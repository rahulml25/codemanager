import { appWindow } from "@tauri-apps/api/window";
import { useEffect, useRef, useState } from "react";

export let titlebarElement: HTMLDivElement | null = null;

type Props = {};

export default function Titlebar({}: Props) {
  const [isMaximized, setIsMaximized] = useState(false);
  const titlebarRef = useRef<HTMLDivElement>(null);

  function maximize() {
    setIsMaximized(true);
    appWindow.maximize();
  }

  function restore() {
    setIsMaximized(false);
    appWindow.unmaximize();
  }

  useEffect(() => {
    (async () => {
      setIsMaximized(await appWindow.isMaximized());
    })();

    titlebarElement = titlebarRef.current;
  }, []);

  return (
    <div
      className="flex h-7 w-full select-none items-center justify-end border-b border-neutral-700/30 bg-neutral-800/75"
      ref={titlebarRef}
    >
      <div
        className="flex h-full grow items-center justify-center"
        data-tauri-drag-region
      >
        <span
          className="text-sm text-[rgb(200,200,200)]"
          data-tauri-drag-region
        >
          Codebases Manager
        </span>
      </div>

      <div className="flex h-full items-center">
        <div
          className="flex h-full w-10 items-center justify-center hover:bg-white/5"
          onClick={() => appWindow.minimize()}
        >
          <img src="/window-icons/minimize.svg" width={11} height={11} />
        </div>

        <div
          className="flex h-full w-10 items-center justify-center hover:bg-white/5"
          onClick={() => (isMaximized ? restore() : maximize())}
        >
          {isMaximized ? (
            <img src="/window-icons/restore.svg" width={11} height={11} />
          ) : (
            <img src="/window-icons/maximize.svg" width={11} height={11} />
          )}
        </div>

        <div
          className="flex h-full w-10 items-center justify-center hover:bg-red-600"
          onClick={() => appWindow.close()}
        >
          <img src="/window-icons/close.svg" width={11} height={11} />
        </div>
      </div>
    </div>
  );
}
