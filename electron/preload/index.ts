import { contextBridge } from "electron"

contextBridge.exposeInMainWorld("env", {
  API_URL: process.env.API_URL,
  APP_NAME: process.env.APP_NAME
})
