import { invoke } from "@tauri-apps/api";

import Sidebar from "@/components/Sidebar";
import Titlebar from "@/components/Titlebar";
import Header from "@/components/Header";
import Dialogs from "@/components/Dialogs";
import ProjectsFeed from "@/components/ProjectFeed";

function App() {
  async function mew() {
    // await invoke("_mew");
    await invoke("get_previous_projects", {
      path: "C:/Code/Rust/code_analyzer",
    })
      .then(console.log)
      .catch(console.log);
    // await create_project().catch(console.log);
    // console.log("projects", await invoke("get_projects"));
  }

  return (
    <div className="h-dvh overflow-hidden rounded-lg border border-neutral-700/70">
      <div className="flex bg-neutral-950">
        <Sidebar />

        <main className="grow">
          <Titlebar />

          <div className="height_witout_titlebar relative flex flex-col overflow-y-auto">
            <Dialogs />

            <Header />

            {/* Temporary */}
            <div className="flex justify-center bg-red-400/20">
              <button
                onClick={mew}
                className="mx-auto w-fit rounded bg-gray-800 px-2 py-0.5"
              >
                Mew
              </button>
            </div>

            <ProjectsFeed />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
