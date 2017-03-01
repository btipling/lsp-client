/* tslint:disable: no-var-requires */
const { app, Menu, BrowserWindow, shell } = require('electron');
const path = require('path');
const url = require('url');
const defaultMenu = require('electron-default-menu');

let win;

function main() {
  win = new BrowserWindow({width: 800, height: 600});

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


