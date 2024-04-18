import path from "path";
import { app, ipcMain } from "electron";
import { createWindow } from "./helpers";
const { CLIENT_URL, clientOut_dirname } = require("../tslib/config");

console.log(CLIENT_URL);


if (!app.isPackaged) {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    await mainWindow.loadFile(
      path.join(__dirname, `${clientOut_dirname}/index.html`)
    );
  } else {
    await mainWindow.loadURL(CLIENT_URL);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
  process.exit(0);
});

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`);
});
