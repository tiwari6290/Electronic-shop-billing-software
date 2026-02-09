import { BrowserWindow } from "electron"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    win.loadFile(
      path.join(__dirname, "../../../dist/renderer/index.html")
    )
  }
}
