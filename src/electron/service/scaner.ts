import { ReadlineParser, SerialPort } from 'serialport'
import { getComPort } from '../utils/store.js';
import { AutoDetectTypes } from '@serialport/bindings-cpp';
import log from 'electron-log';
import { serialNumberEvent, stateMain } from '../utils/state.js';
import { BrowserWindow } from 'electron';
import { ipcMain } from 'electron/main';

let port: SerialPort<AutoDetectTypes>;
let comPort: string;
const regex = /^([A-Z0-9]{5})(\d{8})(\d{6})(\d{10})$/;
let mainWindow: BrowserWindow;
let timerError: NodeJS.Timeout | null = null;
let timerDisconnect: NodeJS.Timeout | null = null;

export function scannerConnect (_mainWindow: BrowserWindow) {
  mainWindow = _mainWindow;
  comPort = getComPort();
  getScannerState();
  controlConnection();
}

export function controlConnection() {
  port = new SerialPort({path: comPort, baudRate: 9600 });
  const parser = port.pipe(new ReadlineParser({ delimiter: '\r' }));

  port.on("open", () => {
      mainWindow.webContents.send("updater_scanner_state", true);
      stateMain.isScannerConnected = true;
      console.log('serial port open');
    });

  port.on("error", (err) => {
      if (!port.isOpen) {
        mainWindow.webContents.send("updater_scanner_state", false);
        stateMain.isScannerConnected = false;
        log.error("Соединениие со сканером потеряно", err);
        timerError = setTimeout(controlConnection, 5000);
      }
  });

  parser.on("data", (line) => {
    if (stateMain.isGetCode && stateMain.isServerConnected) { 
      pasrseSerialNumber(line);
    } else {
      errorHandler(line, null);
    }
  });

  port.on("close", (err: any) => {
    if (err.disconnected !== undefined && err.disconnected) {
      mainWindow.webContents.send("updater_scanner_state", false);
      stateMain.isScannerConnected = false;
      log.error("Соединениие со сканером потеряно", err);
      timerDisconnect = setTimeout(controlConnection, 5000);
    }
  });
}

export function disconnectScanner() {
  if (port?.isOpen) {
    port.removeAllListeners();
    timerError && clearTimeout(timerError);
    timerDisconnect && clearTimeout(timerDisconnect);
    port?.close();
  }
}

function pasrseSerialNumber(line: string) {
  const match = line.match(regex);
  if (match) {
    serialNumberEvent.emit("send_serial_number", line);
    return;
  }
  errorHandler(line, match);
} 

function errorHandler(line: string, match: RegExpMatchArray | null) {
  log.error("Ошибка при сканировании", line);
  if (!stateMain.isServerConnected) {
    mainWindow.webContents.send("scan_error", `Нет связи с сервером. Сканирование невозможно!`);
    return;
  }
  if (!stateMain.isGetCode) {
    mainWindow.webContents.send("scan_error", `Сначала нужно ввести код оператора!`);
    return;
  }
  if (stateMain.isGetBoilerOrder) {
    mainWindow.webContents.send("scan_error", `Уже идёт работа с заказом!`);
    return;
  }
  mainWindow.webContents.send("scan_error", `Не удалось распознать код: ${line}`);
}

function getScannerState() {
  ipcMain.handle("get_scanner_state", (_event: Electron.IpcMainInvokeEvent) => {
    return port?.isOpen ?? false;
  });
}