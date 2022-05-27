const { contextBridge, ipcRenderer } = require('electron');

// store screen source info
let screenSource = null;

ipcRenderer.on('SCREEN_SOURCE', async (_, source) => {
  screenSource = source;
  console.log('capture screen source', source);
});

ipcRenderer.on('SCREEN_SOURCE_ERR', async (_, err) => {
  console.error(err);
});

console.log('preload finished');

// can be reached by "window.T"
contextBridge.exposeInMainWorld('T', {
  ipcRenderer,
  // can only be achieved by closure
  getScreenSource: () => screenSource
});
