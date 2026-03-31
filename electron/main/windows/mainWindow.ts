// import { BrowserWindow, app } from "electron";
// import path from "path";

// export function createMainWindow() {
//   const win = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     show: true,
//     webPreferences: {
//       contextIsolation: true,
//       nodeIntegration: false,
//       preload: path.join(__dirname, "../../preload/index.js"),
//     },
//   });

//   const isDev = !app.isPackaged;

//   if (isDev) {
//     // ✅ DEV
//     win.loadURL("http://localhost:5173");
//     win.webContents.openDevTools();
//   } else {
//     // ✅ FIXED PRODUCTION PATH
//     win.loadFile(
//       path.join(app.getAppPath(), "dist/renderer/index.html")
//     );
//   }
// }
import { BrowserWindow, app } from "electron";
import path from "path";

export function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    // ✅ ADD THIS LINE
    icon: path.join(process.cwd(), "assets/icon.ico"),

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../../preload/index.js"),
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(
      path.join(__dirname, "../../../renderer/index.html")
    );
  }
}