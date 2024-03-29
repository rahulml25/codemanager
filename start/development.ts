import { cpx, execAsync } from "./lib";

const main = async () => {
  execAsync("cd server && npm run dev");
  execAsync("npx tsc --watch");
  cpx.watch("src/loader.html", "app/loader.html");
  execAsync("electron .");
};

main();
