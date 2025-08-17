const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

app.disableHardwareAcceleration();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    }
  });

  mainWindow.loadFile('renderer/index.html');
  // Debugging disabled
  //mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

async function readDirectoryRecursive(dirPath) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const result = [];
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      if (file.isFile()) {
        const stat = await fs.stat(fullPath);
        result.push({
          name: file.name,
          path: fullPath,
          isDirectory: false,
          size: stat.size,
          mtime: stat.mtime
        });
      } else if (file.isDirectory()) {
        try {
          const subFiles = await readDirectoryRecursive(fullPath);
          result.push(...subFiles);
        } catch (err) {
          console.error(`Error reading directory ${fullPath}:`, err);
        }
      }
    }
    return result;
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
    return [];
  }
}

// IPC handlers
ipcMain.handle('select-directory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('read-directory', async (event, dirPath) => {
  return readDirectoryRecursive(dirPath);
});

ipcMain.handle('calculate-hash', async (event, filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (err) {
    console.error(`Error calculating hash for ${filePath}:`, err);
    return null;
  }
});

ipcMain.handle('delete-file', async (event, filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
    return false;
  }
});

ipcMain.handle('open-file-location', async (event, filePath) => {
  const { shell } = require('electron');
  await shell.showItemInFolder(filePath);
  return true;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, options);
  return canceled ? null : filePath;
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content);
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
});
