const { app, BrowserWindow, desktopCapturer, ipcMain } = require('electron');
const path = require('path');
const robot = require('robotjs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    // no alt, no menu bar
    autoHideMenuBar: true
  });

  /**
   * capture screen and pass source id
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
            'too many screen sources'
          );
        }
      })
      .catch((e) => mainWindow.webContents.send('SCREEN_SOURCE_ERR', e));
  });

  /**
   * full screen
   */
  ipcMain.on('FULL_SCREEN', () => {
    mainWindow.setFullScreen(true);
  });
  ipcMain.on('CANCEL_FULL_SCREEN', () => {
    mainWindow.setFullScreen(false);
  });

  /**
   * resize window
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

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
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

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// node version: 16.14.2
// console.log(process.versions)
