import Sidebar from "@/components/Sidebar";
import Titlebar from "@/components/Titlebar";
import Header from "@/components/Header";
import Dialogs from "@/components/Dialogs";
import ProjectsFeed from "@/components/ProjectFeed";

function App() {
  return (
    <div className="h-dvh overflow-hidden rounded-lg border border-neutral-700/70">
      <div className="flex bg-neutral-950">
        <Sidebar />

        <main className="grow">
          <Titlebar />

          <div className="height_witout_titlebar relative flex flex-col overflow-y-auto">
            <Dialogs />
            <Header />
            <ProjectsFeed />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
