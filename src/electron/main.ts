import { app, BrowserWindow} from 'electron';
import { isDev, runSettings } from './utils/util.js';
import { connect, disconnectServer } from './service/exchange_server.js';
import { getPreloadPath, getUIPath } from './utils/pathResolver.js';
import { disconnectScanner, scannerConnect } from './service/scaner.js';
import { storeInitialize } from './utils/store.js';
import { disconnectPrinter, printerConnect } from './service/exchange_printer.js';
import { changeTypeLabel, resetOperatorCode, resteMainState } from './utils/state.js';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
        preload: getPreloadPath(),
    }
  });
  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(getUIPath());
  }

  mainWindow.once('ready-to-show', () => {
    storeInitialize();
    runSettings();
    printerConnect(mainWindow);
    scannerConnect(mainWindow);
    connect(mainWindow);
    resteMainState();
    resetOperatorCode();
    changeTypeLabel();
  });
}

app.whenReady().then(() => {
  createWindow();
})

app.on('window-all-closed', () => {
  disconnectServer();
  disconnectScanner();
  disconnectPrinter();
  app.quit()
})
