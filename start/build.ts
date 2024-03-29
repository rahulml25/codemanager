import { cpx, execAsync } from "./lib";

const main = async () => {
  await execAsync("npx tsc");
  cpx.copySync("src/loader.html", "app");
  execAsync("electron-builder --win");
};

main();
