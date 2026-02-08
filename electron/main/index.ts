import { app } from "electron"
import dotenv from "dotenv"
import { createMainWindow } from "./windows/mainWindow"

dotenv.config();

console.log(process.env.API_URL);

app.whenReady().then(() => {
  createMainWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})