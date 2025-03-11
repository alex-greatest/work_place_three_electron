import { ipcMain } from "electron";
import EventEmitter from "events";

export const serialNumberEvent = new EventEmitter();

export const stateMain: StateMain = {
  user: { username: "", code: 0, roleDto: { name: "" } },
  isGetCode: false,
  shiftNumber: 0,
  isServerConnected: false,
  isScannerConnected: false,
  isPrinterConnected: false,
  isGetBoilerResponseWpTwo: false
};

export function resteMainState() {
  ipcMain.handle("reset_main_state", (_event: Electron.IpcMainInvokeEvent) => {
    stateMain.isGetBoilerResponseWpTwo = false;
  });
}

export function resetOperatorCode() {
  ipcMain.handle("reset_operator_code",(_event: Electron.IpcMainInvokeEvent) => {
      stateMain.isGetCode = false;
      stateMain.user = { username: "", code: 0, roleDto: { name: "" } };
  });
}
