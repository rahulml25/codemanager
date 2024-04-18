import { execAsync } from "../../tslib/utils";
import { clientDev_PORT } from "../../tslib/config";
import fs from "fs";
import archiver from "archiver";
import path from "path";

const main = async () => {
  const command = process.argv[2];

  if (command == "build") {
    execAsync("cd server && bun run build");
    execAsync(
      `".venv/Scripts/pyinstaller" scripts/python/cli/main.py -n codemg --onefile`
    );
    execAsync(
      `".venv/Scripts/pyinstaller" scripts/python/installer.py -n codemg-setup --onefile`
    );
    await Promise.all([
      execAsync("cd client && npm run build"),
      execAsync("cd app && tsc"),
    ]);
    execAsync("electron-builder --win -p never");
  } else if (command == "dev") {
    execAsync("cd server && bun dev");
    execAsync("cd client && npm run dev");
    execAsync("cd app && tsc --watch");
    execAsync(`wait-on tcp:${clientDev_PORT} && electron .`);
  } else if (command == "fullinstall") {
    execAsync("electron-builder install-app-deps");
    execAsync("cd client && npm i");
    execAsync("cd server && bun i");
    execAsync(
      `python -m venv .venv && ".venv/Scripts/pip" install -r requirements.txt`
    );
  } else if (command == "bundle") {
    const distDir = path.resolve(__dirname, "../../dist/");
    const vUtilsDir = "bin/utils";
    const config = require("../../package.json");

    const archive = archiver("zip");

    const output = fs.createWriteStream(
      path.resolve(distDir, "codemanager.zip")
    );

    archive.pipe(output);

    archive.file(path.resolve(distDir, "codemg.exe"), {
      name: "bin/codemg.exe",
    });
    archive.file(path.resolve(distDir, "codemg-server.exe"), {
      name: `${vUtilsDir}/codemg-server.exe`,
    });
    archive.file(path.resolve(distDir, "codemg-setup.exe"), {
      name: `${vUtilsDir}/codemg-setup.exe`,
    });
    archive.file(
      path.resolve(
        distDir,
        `app_win32/${config.build.productName} Setup ${config.version}.exe`
      ),
      { name: `${vUtilsDir}/GUI-Setup.exe` }
    );

    await archive.finalize();
  }
};

main();
