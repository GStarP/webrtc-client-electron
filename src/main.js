const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron');
const path = require('path');
const robot = require('robotjs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

/* main function */
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    // extra space for devtool
    width: 1380,
    height: 720,
    // preload script
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    // hide menu bar
    autoHideMenuBar: true
  });

  /**
   * capture screen and pass source info
   */
  ipcMain.on('CAPTURE_SCREEN', () => {
    desktopCapturer
      .getSources({ types: ['screen'] })
      .then(async (sources) => {
        if (sources.length > 0) {
          mainWindow.webContents.send('SCREEN_SOURCE', sources[0]);
        } else {
          mainWindow.webContents.send(
            'SCREEN_SOURCE_ERR',
            'no screen source captured'
          );
        }
      })
      .catch((e) => mainWindow.webContents.send('SCREEN_SOURCE_ERR', e));
  });

  /**
   * resize window
   * @param size { width, height }
   */
  ipcMain.on('RESIZE', (_, size) => {
    mainWindow.setSize(size.width, size.height);
    mainWindow.center();
  });

  /**
   * move mouse
   * @param pos [x, y]
   */
  ipcMain.on('MOVE_MOUSE', (_, pos) => {
    robot.moveMouse(pos[0], pos[1]);
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On OS X it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// node version: 16.14.2
// console.log(process.versions)
