const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("browser", {
  newTab: () => ipcRenderer.send("new-tab"),
  openSettings: () => ipcRenderer.send("open-settings"),
  navigate: url => ipcRenderer.send("navigate", url),
  back: () => ipcRenderer.send("back"),
  forward: () => ipcRenderer.send("forward"),
  reload: () => ipcRenderer.send("reload"),
  switchTab: id => ipcRenderer.send("switch-tab", id),
  onTabs: cb => ipcRenderer.on("tabs", (_, tabs) => cb(tabs))
});
