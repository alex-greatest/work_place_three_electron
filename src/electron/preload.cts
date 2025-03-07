import { contextBridge, ipcRenderer } from "electron/renderer";

contextBridge.exposeInMainWorld("exchangeServerAPI", {
  requestGetLastBoilerOrderAfterClose: () => ipcRenderer.invoke("request_last_boiler_order_after_close"),
  onUpdateConnectionServerState: (callback: callbackBoolean) => {
    ipcRenderer.on("updater_connection_server_state", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("updater_connection_server_state", callback); };
  },
  requestOperatorCode: (code: number) => ipcRenderer.invoke("request_operator_code", code),
  onResponseOperatorCode: (callback: callbackUserResponse) => {
    ipcRenderer.on("response_operator_code", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_operator_code", callback); };
  },
  onResponseShift: (callback: callbackShiftResponse) => {
    ipcRenderer.on("response_shift", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_shift", callback); };
  },
  onResponseBoiierOrder: (callback: callbackBoilerOrder) => {
    ipcRenderer.on("response_boiler_order", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_boiler_order", callback); };
  },
  onRequestBoilerOrder: (callback: callbackBoolean) => {
    ipcRenderer.on("request_boiler_order", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("request_boiler_order", callback); };
  },
  onResponseAmountBoiler: (callback: callbackShiftResponse) => {
    ipcRenderer.on("response_amount_made_boiler_shift", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_amount_made_boiler_shift", callback); };
  },
  onResponseAmountBoilerPrintedOrder: (callback: callbackAmountOrderPrintedResponse) => {
    ipcRenderer.on("response_amount_boiler_printer_order", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_amount_boiler_printer_order", callback); };
  },
  requestPrint: () => ipcRenderer.invoke("request_printer_server"),
  onResponsePrint: (callback: callbackBoilerResponse) => {
    ipcRenderer.on("response_print_server", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_print_server", callback); };
  },
  requestBoilerHistory: (pageNumber: number) => ipcRenderer.invoke("request_boiler_history", pageNumber),
  onResponseBoilerHistory: (callback: callbackBoilerHistory) => {
    ipcRenderer.on("response_boiler_history", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_boiler_history", callback); };
  },
  requestBoilerHistoryManual: (id: string, pageNumber: number) => ipcRenderer.invoke("request_boiler_history_manual", id, pageNumber),
  onResponseBoilerHistoryManual: (callback: callbackBoilerHistory) => {
    ipcRenderer.on("response_boiler_history_manual", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_boiler_history_manual)", callback); };
  },
  requestUserAuthorization: (userAuthorization: UserRequestAuthorization) => ipcRenderer.invoke("request_user_authorization", userAuthorization),
  onResponseUserAuthorization: (callback: callbackUserResponse) => {
    ipcRenderer.on("response_user_authorization", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_user_authorization", callback); };
  },
  onResponseUniqueIdBoiierOrder: (callback: callbackBoilerOrder) => {
    ipcRenderer.on("response_unique_id_boiler_order", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_unique_id_boiler_order", callback); };
  },
  onResponseLastBoiierOrder: (callback: callbackBoilerOrder) => {
    ipcRenderer.on("response_last_boiler_order", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_last_boiler_order", callback); };
  },
});


contextBridge.exposeInMainWorld("exchangeScanner", {
  onUpdateConnectionScannerState: (callback: callbackBoolean) => {
    ipcRenderer.on("updater_scanner_state", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("updater_scanner_state", callback); };
  },
  onResponseScanError: (callback: callbackString) => {
    ipcRenderer.on("scan_error", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("scan_error", callback); };
  },
  requestScanManual: (isScan: boolean) => ipcRenderer.invoke("request_scan_manual", isScan),
  onResponseScanManual: (callback: callbackString) => {
    ipcRenderer.on("response_scan_manual", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_scan_manual", callback); };
  },
  onResponseScanManualError: (callback: callbackString) => {
    ipcRenderer.on("response_scan_manual_error", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("response_scan_manual_error", callback); };
  },
});

contextBridge.exposeInMainWorld("exchangePrinter", {
  onUpdateConnectionPrinterState: (callback: callbackBoolean) => {
    ipcRenderer.on("updater_connection_printer_state", (_event, value) => callback(_event, value));
    return () => { ipcRenderer.removeListener("updater_connection_printer_state", callback); };
  },
  requestPrintHistory: (boilerResponse: BoilerHistoryResponse) => ipcRenderer.invoke("request_print_history", boilerResponse),
  onResponsePrintHistory: (callback: callbackBooleanError) => {
    ipcRenderer.on("response_print_history", (_event, error, errorMessage) => callback(_event, error, errorMessage));
    return () => { ipcRenderer.removeListener("response_print_history", callback); };
  },
});

contextBridge.exposeInMainWorld("syncState", {
  requestMainStateReset: () => ipcRenderer.invoke("reset_main_state"),
  onResponsePrintHistory: (callback: callbackBooleanError) => {
    ipcRenderer.on("response_print_history", (_event, error, errorMessage) => callback(_event, error, errorMessage));
    return () => { ipcRenderer.removeListener("response_print_history", callback); };
  },
  requestOperatorCodeReset: () => ipcRenderer.invoke("reset_operator_code"),
  requestChangeTypeLabel: (typeLabel: string) => ipcRenderer.invoke("change_type_label", typeLabel),
});
