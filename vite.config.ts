import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "./",
  root: "renderer",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "renderer/src")
    }
  },
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: true
  }
})