import path from "path";
import { app, ipcMain } from "electron";
import { createWindow } from "./helpers";

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

  await mainWindow.loadFile(path.join(__dirname, "loader.html"));

  if (!app.isPackaged) {
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
