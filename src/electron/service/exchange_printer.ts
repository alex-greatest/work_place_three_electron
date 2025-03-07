import { BrowserWindow, ipcMain } from "electron/main";
import net from "net";
import { getIpAdress, getPort } from "../utils/store.js";
import log from "electron-log";
import { canbanEvent, stateMain } from "../utils/state.js";

let mainWindow: BrowserWindow;
let client: net.Socket;
let port: number = 0;
let ipAdress: string = "";
let timerError: NodeJS.Timeout | null = null;
let isConnected = false;
let isPrinting = false;

export function printerConnect(_mainWindow: BrowserWindow) {
    mainWindow = _mainWindow;
    changeStateSubscribeRender();
    ipAdress = getIpAdress();
    port = getPort();
    runConnection();
    requestPrintHistory();
}

function runConnection() {
    client = new net.Socket();
    client.connect({host: ipAdress, port: port}, () => {
        console.log(`Successfully established a TCP connection on localhost:${port}`);
        mainWindow.webContents.send("updater_connection_printer_state", true);
        isConnected = true;
        stateMain.isPrinterConnected = true;
    });
    client.on("error", function (error) {
        log.error("Ошибка при работе с принтером", error);
        log.error("Attempting to reconnect shortly");
    });
    client.on("close", (error) => {
        if (error) {
            log.error("Ошибка при работе с принтером", error);
        }
        isConnected = false;
        client.end();
        client.destroy();
        mainWindow.webContents.send("updater_connection_printer_state", false);        
        stateMain.isPrinterConnected = false;
        timerError = setTimeout(runConnection, 5000);
    });
}

export function disconnectPrinter() {
    if (client && isConnected) {
        timerError && clearTimeout(timerError);
        client.removeAllListeners();
        client.end();
        client.destroy();
    }
}

function changeStateSubscribeRender() {
  ipcMain.handle("updater_connection_printer_state_rerender", (_event: Electron.IpcMainInvokeEvent) => {
    return isConnected;
  });
}

canbanEvent.on("run_print", (boiler: Boiler) => {
    if (isConnected && client) {
        try {
            isPrinting = true;
            client.write(`${boiler.serialNumber}\n`);
            canbanEvent.emit("printer_response", boiler);
            isPrinting = false;
        } catch (error) {
            log.error("Ошибка при отправке данных на печать", error);
            isPrinting = false;
        }
    }
});

function requestPrintHistory() {
    ipcMain.handle("request_print_history", (_event: Electron.IpcMainInvokeEvent, boilerResponse: BoilerHistoryResponse) => {
        console.log("requestNaxNax");
        if (isConnected && !isPrinting && client) {
            client.write(`${boilerResponse.serialNumber}\n`);
            mainWindow.webContents.send("response_print_history", false, "");
            return;
        }
        if (isPrinting) {
            mainWindow.webContents.send("response_print_history", true, "Печать уже выполняется");
        }
        if (!isConnected) {
            mainWindow.webContents.send("response_print_history", true, "Нет связи с принтером");
        }
    });
  }