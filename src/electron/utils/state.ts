import { ipcMain } from "electron";
import EventEmitter from "events";

function resesBoilerOrderState(): BoilerOrder {
  return {
    id: "",
    isDataExists: false,
    orderNumber: 0,
    article: "",
    amountBoilerOrder: 0,
    amountBoilerPrint: 0,
    codeScan: "",
    dateScan: "",
  }
}

export const canbanEvent = new EventEmitter();

export const stateMain: StateMain = {
  user: { username: "", code: 0, roleDto: { name: "" } },
  isGetCode: false,
  isGetBoilerOrder: false,
  isGetUniqueBoilerOrder: false,
  shiftNumber: 0,
  boilerOrder: resesBoilerOrderState(),
  isServerConnected: false,
  isScannerConnected: false,
  isPrinterConnected: false,
  typelabel: "",
};

export function resteMainState() {
  ipcMain.handle("reset_main_state", (_event: Electron.IpcMainInvokeEvent) => {
    stateMain.isGetBoilerOrder = false;
    stateMain.isGetUniqueBoilerOrder = false;
    stateMain.boilerOrder = resesBoilerOrderState();
  });
}

export function resetOperatorCode() {
  ipcMain.handle("reset_operator_code",(_event: Electron.IpcMainInvokeEvent) => {
      stateMain.isGetCode = false;
      stateMain.user = { username: "", code: 0, roleDto: { name: "" } };
  });
}

export function changeTypeLabel() {
  ipcMain.handle("change_type_label",(_event: Electron.IpcMainInvokeEvent, typeLabel: string) => {
    stateMain.typelabel = typeLabel;
  });
}