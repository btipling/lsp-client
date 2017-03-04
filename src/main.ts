/* tslint:disable: no-var-requires */
const electron = require('electron');
const { app, Menu, BrowserWindow, shell } = electron;
const path = require('path');
const url = require('url');
const defaultMenu = require('electron-default-menu');

let win;

function main() {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({ width: width, height: height });
  win.webContents.openDevTools();

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  win.on('closed', () => {
    win = null;
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)));
}

app.on('ready', main);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    main();
  }
});


