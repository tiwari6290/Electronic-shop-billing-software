export {}

declare global {
  interface Window {
    ipcRenderer: {
      on: (
        channel: string,
        listener: (event: any, message: any) => void
      ) => void
      send: (channel: string, ...args: any[]) => void
    }
  }
}
