import { ipcMain } from "electron"
import { IPC } from "./channels"

export function registerIpcHandlers() {
  ipcMain.handle(IPC.PING, () => "pong from main")
}
