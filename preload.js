const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  calculateHash: (filePath) => ipcRenderer.invoke('calculate-hash', filePath),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  openFileLocation: (filePath) => ipcRenderer.invoke('open-file-location', filePath),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
});
