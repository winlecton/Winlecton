const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Parse --os flag from command line args
const args = process.argv.slice(2);
const osArg = args.find(a => a.startsWith('--os='));
const selectedOS = osArg ? osArg.split('=')[1] : 'win11';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Load boot screen first
  const bootFile = selectedOS === 'win10'
    ? path.join(__dirname, 'BOOT', 'Microsoft', 'win10', 'boot', 'boot.html')
    : path.join(__dirname, 'BOOT', 'Microsoft', 'win11', 'boot', 'boot.html');

  mainWindow.loadFile(bootFile);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC: navigate to desktop after boot
ipcMain.on('boot-complete', (event, os) => {
  const desktopFile = os === 'win10'
    ? path.join(__dirname, 'BOOT', 'Microsoft', 'win10', 'src', 'desktop', 'desktop.html')
    : path.join(__dirname, 'BOOT', 'Microsoft', 'win11', 'src', 'desktop', 'desktop.html');
  mainWindow.loadFile(desktopFile);
});

ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());