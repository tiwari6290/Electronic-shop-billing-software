import { contextBridge } from "electron"

contextBridge.exposeInMainWorld("env", {
  API_URL: "https://mondal-billing-backend-production.up.railway.app/api",
  APP_NAME: "Electronic Shop Billing"
})