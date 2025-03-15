import { contextBridge, ipcRenderer } from "electron/renderer";

contextBridge.exposeInMainWorld("exchangeServerAPI", {
  requestGetLastBoilerOrderAfterClose: () => ipcRenderer.invoke("request_last_boiler_order_after_close"),
  onUpdateConnectionServerState: (callback: callbackBoolean) => {
    const listener = (_event: Electron.IpcRendererEvent, value: boolean) => callback(_event, value);
    ipcRenderer.on("updater_connection_server_state", listener);
    return () => { ipcRenderer.removeListener("updater_connection_server_state", listener); };
  },
  requestOperatorCode: (code: number) => ipcRenderer.invoke("request_operator_code", code),
  onResponseOperatorCode: (callback: callbackUserResponse) => {
    const listener = (_event: Electron.IpcRendererEvent, value: UserResponse | ErrorResponse) => callback(_event, value);
    ipcRenderer.on("response_operator_code", listener);
    return () => { ipcRenderer.removeListener("response_operator_code", listener); };
  },
  onResponseShift: (callback: callbackShiftResponse) => {
    const listener = (_event: Electron.IpcRendererEvent, value: number | ErrorResponse) => callback(_event, value);
    ipcRenderer.on("response_shift", listener);
    return () => { ipcRenderer.removeListener("response_shift", listener); };
  },
  onResponseComponents: (callback: callbackComponentsResponse) => {
    const listener = (_event: Electron.IpcRendererEvent, value: ComponentsResponse | ComponentsErrorRoute) => callback(_event, value);
    ipcRenderer.on("response_components", listener);
    return () => { ipcRenderer.removeListener("response_components", listener); };
  },
  onRequestBoilerOrder: (callback: callbackBoolean) => {
    const listener = (_event: Electron.IpcRendererEvent, value: boolean) => callback(_event, value);
    ipcRenderer.on("request_boiler_order", listener);
    return () => { ipcRenderer.removeListener("request_boiler_order", listener); };
  },
  onResponseAmountBoiler: (callback: callbackShiftResponse) => {
    const listener = (_event: Electron.IpcRendererEvent, value: number | ErrorResponse) => callback(_event, value);
    ipcRenderer.on("response_amount_made_boiler_shift", listener);
    return () => { ipcRenderer.removeListener("response_amount_made_boiler_shift", listener); };
  },
  requestUserAuthorization: (userAuthorization: UserRequestAuthorization) => ipcRenderer.invoke("request_user_authorization", userAuthorization),
  onResponseUserAuthorization: (callback: callbackUserResponse) => {
    const listener = (_event: Electron.IpcRendererEvent, value: UserResponse | ErrorResponse) => callback(_event, value);
    ipcRenderer.on("response_user_authorization", listener);
    return () => { ipcRenderer.removeListener("response_user_authorization", listener); };
  },
  requestSerialNumberAllowStart: (serialNumber: string) => ipcRenderer.invoke("request_serial_number_allow_start", serialNumber),
  onResponseWait: (callback: callbackEmpty) => {
    const listener = (_event: Electron.IpcRendererEvent) => callback(_event);
    ipcRenderer.on("response_wait", listener);
    return () => { ipcRenderer.removeListener("response_wait", listener); };
  },
  requestInterruptedOperation: (interruptedRequest: InterruptedRequest) => ipcRenderer.invoke("request_interrupted_operation", interruptedRequest),
  onResponseInterruptedOperation: (callback: callbackErrorResponse) => {
    const listener = (_event: Electron.IpcRendererEvent, value: ErrorResponse) => callback(_event, value);
    ipcRenderer.on("response_interrupted_operation", listener);
    return () => { ipcRenderer.removeListener("response_interrupted_operation", listener); };
  },
  requestSaveResultComponents: (componentsResult: ComponentsResult[]) => 
    ipcRenderer.invoke("request_operation_save_results", componentsResult),
  onResponseSaveResultComponents: (callback: callbackErrorResponseString) => {
    const listener = (_event: Electron.IpcRendererEvent, value: ErrorResponse | string) => callback(_event, value);
    ipcRenderer.on("response_operation_save_results", listener);
    return () => { ipcRenderer.removeListener("response_operation_save_results", listener); };
  },
});

contextBridge.exposeInMainWorld("exchangeScanner", {
  onUpdateConnectionScannerState: (callback: callbackBoolean) => {
    const listener = (_event: Electron.IpcRendererEvent, value: boolean) => callback(_event, value);
    ipcRenderer.on("updater_scanner_state", listener);
    return () => { ipcRenderer.removeListener("updater_scanner_state", listener); };
  },
  onResponseScanError: (callback: callbackString) => {
    const listener = (_event: Electron.IpcRendererEvent, value: string) => callback(_event, value);
    ipcRenderer.on("scan_error", listener);
    return () => { ipcRenderer.removeListener("scan_error", listener); };
  },
  requestScanManual: (isScan: boolean) => ipcRenderer.invoke("request_scan_manual", isScan),
  onResponseScanManual: (callback: callbackString) => {
    const listener = (_event: Electron.IpcRendererEvent, value: string) => callback(_event, value);
    ipcRenderer.on("response_scan_manual", listener);
    return () => { ipcRenderer.removeListener("response_scan_manual", listener); };
  },
  onResponseScanManualError: (callback: callbackString) => {
    const listener = (_event: Electron.IpcRendererEvent, value: string) => callback(_event, value);
    ipcRenderer.on("response_scan_manual_error", listener);
    return () => { ipcRenderer.removeListener("response_scan_manual_error", listener); };
  },
  requestScannedComponentsAllowed: (isScan: boolean) => ipcRenderer.invoke("request_scan_components_allowed", isScan),
  onResponseScanСomponents: (callback: callbackString) => {
    const listener = (_event: Electron.IpcRendererEvent, value: string) => callback(_event, value);
    ipcRenderer.on("response_scan_components", listener);
    return () => { ipcRenderer.removeListener("response_scan_components", listener); };
  },
});

contextBridge.exposeInMainWorld("syncState", {
  requestMainStateReset: () => ipcRenderer.invoke("reset_main_state"),
  requestOperatorCodeReset: () => ipcRenderer.invoke("reset_operator_code"),
  requestChangeTypeLabel: (typeLabel: string) => ipcRenderer.invoke("change_type_label", typeLabel),
});