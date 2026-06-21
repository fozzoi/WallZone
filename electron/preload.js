const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setWallpaper: (imageUrl) => ipcRenderer.invoke('set-wallpaper', imageUrl),
  isElectron: true,
});
