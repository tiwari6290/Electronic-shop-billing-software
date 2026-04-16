import { contextBridge } from "electron"

contextBridge.exposeInMainWorld("env", {
  API_URL: "https://mondal-billing-backend.onrender.com/api",
  APP_NAME: "Electronic Shop Billing"
})