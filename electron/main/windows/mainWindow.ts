import { BrowserWindow } from "electron"
import path from "path"

const isDev = !process.env.APP_PACKAGED

export function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../../preload/index.js")
    }
  })

  if (isDev) {
    win.loadURL("http://localhost:5173")
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, "../../../dist/renderer/index.html"))
  }
}
