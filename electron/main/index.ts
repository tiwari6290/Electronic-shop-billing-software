import { app, dialog } from "electron"
import dotenv from "dotenv"
import { autoUpdater } from "electron-updater"
import { createMainWindow } from "./windows/mainWindow.js"

dotenv.config()

console.log(process.env.API_URL)

// ── Auto Updater Config ──────────────────────
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function initAutoUpdater() {
  // only check in production (not during dev)
  if (!app.isPackaged) return

  autoUpdater.checkForUpdates()

  autoUpdater.on("update-available", () => {
    console.log("Update available — downloading...")
  })

  autoUpdater.on("update-downloaded", () => {
    dialog.showMessageBox({
      type: "info",
      title: "Update Ready",
      message: "A new update has been downloaded. Restart the app to apply it.",
      buttons: ["Restart Now", "Later"]
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })

  autoUpdater.on("error", (err) => {
    console.error("Auto updater error:", err)
  })
}
// ─────────────────────────────────────────────

app.whenReady().then(() => {
  createMainWindow()
  initAutoUpdater() // ← runs after window is ready
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
