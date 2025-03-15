import { ipcMain } from "electron";
import EventEmitter from "events";

export const serialNumberEvent = new EventEmitter();

export const stateMain: StateMain = {
  user: { username: "", code: 0, roleDto: { name: "" } },
  shiftNumber: 0,
  isServerConnected: false,
  isScannerConnected: false,
  isPrinterConnected: false,
  isGetCode: false,
  isScannedComponentsAllowed: false,
  isRunCycle: false
};

export function resteMainState() {
  ipcMain.handle("reset_main_state", (_event: Electron.IpcMainInvokeEvent) => {
    resetOperatorCode();
    stateMain.isScannedComponentsAllowed = false;
    stateMain.isRunCycle = false;
  });
}

export function resetOperatorCode() {
  ipcMain.handle("reset_operator_code",(_event: Electron.IpcMainInvokeEvent) => {
      stateMain.user = { username: "", code: 0, roleDto: { name: "" } };
  });
}

export function createRequestComponents(serialNumber: string, allowStart: boolean = false) {
  return {
    numberShift: stateMain.shiftNumber,
    userCode: stateMain.user.code,
    serialNumber: serialNumber,
    stationName: "wp2",
    prevStationName: "wp1",
    isAllowStart: allowStart
  };
}