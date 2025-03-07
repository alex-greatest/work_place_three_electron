import { ReadlineParser, SerialPort } from 'serialport'
import { getComPort } from '../utils/store.js';
import { AutoDetectTypes } from '@serialport/bindings-cpp';
import log from 'electron-log';
import { canbanEvent, stateMain } from '../utils/state.js';
import dayjs from 'dayjs';
import { BrowserWindow } from 'electron';
import { ipcMain } from 'electron/main';

let port: SerialPort<AutoDetectTypes>;
let comPort: string;
const regex = /^(\d{3})(\d{10})([1-9]\d{0,2})$/;
let mainWindow: BrowserWindow;
let timerError: NodeJS.Timeout | null = null;
let timerDisconnect: NodeJS.Timeout | null = null;
let isScanManul: boolean = false;

export function scannerConnect (_mainWindow: BrowserWindow) {
  mainWindow = _mainWindow;
  comPort = getComPort();
  getScannerState();
  controlConnection();
  requestManual();
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
    if (isScanManul) {
      pasrseCodeManual(line);
      return;
    }
    if (stateMain.isGetCode && !stateMain.isGetUniqueBoilerOrder) {
      pasrseUniqueIdBoilerCode(line);
    }
    if (stateMain.isGetCode && stateMain.isGetUniqueBoilerOrder && !stateMain.isGetBoilerOrder) { 
      pasrseBoilerCode(line);
    }
  }
  );
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

function pasrseUniqueIdBoilerCode(line: string) {
    if (line.length === 10 && !isNaN(Number(line))) {
      const boilerIdUniqueRequest = {
        userCode: stateMain.user.code,
        id: line,
        numberShift: stateMain.shiftNumber
      };
      canbanEvent.emit("send_unique_boiler", boilerIdUniqueRequest);
      return;
    }
    mainWindow.webContents.send("scan_error", `Не удалось распознать код ${line}!`);
}

function pasrseBoilerCode(line: string) {
  const match = line.match(regex);
  const codeIsOk = match && stateMain.isGetCode && !stateMain.isGetBoilerOrder && Number(match[3]) > 0 && stateMain.isServerConnected;
  if (codeIsOk) {
    const canban = {
      id: stateMain.boilerOrder.id,
      numberOrder: Number(match[1]), 
      article: match[2], 
      amountBoilerOrder: Number(match[3]), 
      dateScan: dayjs(), 
      code: line,
      userCode: stateMain.user.code,
      numberShift: stateMain.shiftNumber
    };
    canbanEvent.emit("send_boiler", canban);
    return;
  }
  checkCodeAfterNotOK(line, match);
} 

function pasrseCodeManual(line: string) {
  if (line.length === 10 && !isNaN(Number(line))) {
    mainWindow.webContents.send("response_scan_manual", line);
    return;
  }
  mainWindow.webContents.send("response_scan_manual_error", `Не удалось распознать код: ${line}`);
}


function checkCodeAfterNotOK(line: string, match: RegExpMatchArray | null) {
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
  if (match && Number(match[3]) <= 0) {
    mainWindow.webContents.send("scan_error", `Количество котлов в заказе не может быть меньше или равно 0!`);
    return;
  }
  mainWindow.webContents.send("scan_error", `Не удалось распознать код: ${line}`);
}

function getScannerState() {
  ipcMain.handle("get_scanner_state", (_event: Electron.IpcMainInvokeEvent) => {
    return port?.isOpen ?? false;
  });
}

function requestManual() {
  ipcMain.handle("request_scan_manual", (_event: Electron.IpcMainInvokeEvent, isScan) => {
    isScanManul = isScan;
  });
}