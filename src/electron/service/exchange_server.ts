import { Client, IStompSocket, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import { createRequestComponents, serialNumberEvent, stateMain } from '../utils/state.js';

let mainWindow: BrowserWindow;

const client = new Client({
  brokerURL: 'ws://localhost:8080/ws',
  debug: function (str) {
    console.log(str);
    log.error(str);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

export function connect(_mainWindow: BrowserWindow) {
  mainWindow = _mainWindow
  client.webSocketFactory = function () {
    return new SockJS('http://localhost:8080/ws') as IStompSocket;
  };
  client.onConnect = function (_) {
    mainWindow.webContents.send("updater_connection_server_state", true);
    stateMain.isServerConnected = true;
    subscribe();
    subscribeError();
    client?.connected && client.publish({
      destination: "/app/shift/made/boiler/get_info/request",
      body: "wp2",
      skipContentLengthHeader: true,
    });
    client?.connected && client.publish({
      destination: "/app/shift/get_info/request",
      body: "wp2",
      skipContentLengthHeader: true,
    });
  };
  client.onWebSocketClose = (error) => {
    log.error("Нет связи с сервером", error);
    mainWindow.webContents.send("updater_connection_server_state", false);
    stateMain.isServerConnected = false;
  }
  client.onStompError = function (error) {
    log.error("Нет связи с сервером потеряна", error); 
    mainWindow.webContents.send("updater_connection_server_state", false);
    stateMain.isServerConnected = false;
  }
  client.activate();
  requestAmountBoileramountShiftMadeBoiler();
  requestShift();
  requestOperatorCode();
  requestUserAuthorization();
  requestLastOperation();
  requestSerialNumberAllowStart();
  requestInterruptedOperation();
  requestSaveResultComponents();
}

export function disconnectServer() {
  if (client?.connected) {
    client.deactivate({force: true});
  }
}

function subscribe() {
  client.subscribe('/message/wp2/user/get_info/response', (message) => responseOperatorCode(message));
  client.subscribe('/message/wp2/user/authorization/response', (message) => responseUserAuthorization(message));
  client.subscribe('/message/wp2/shift/get_info/response', (message) => responseShift(message));
  client.subscribe('/message/wp2/shift/amount/made/boiler/get_info/response', (message) => responseAmountBoilerShift(message));
  client.subscribe('/message/station/wp2/operation/response', (message) => responseComponents(message));
  client.subscribe('/message/station/wp2/operation/response', (message) => responseComponents(message));
  client.subscribe('/message/station/wp2/interrupted/operation/response', (message) => responseInterruptedOperation(message));
  client.subscribe('/message/current/shift', (message) => resetShift(message));
  client.subscribe('/message/station/wp2/end/operation/response', (message) => responseSaveResultComponents(message));


  client.subscribe('/message/station/wp2/operation/get/last/response', (message) => responseLastOperation(message));
}

function subscribeError() {
  client.subscribe('/message/wp2/user/get_info/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_operator_code", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp2/shift/get_info/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_shift", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp2/shift/amount/made/boiler/get_info/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_amount_made_boiler_shift", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp2/user/authorization/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_user_authorization", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/station/wp2/start/operation/errors', (message) => responseErrorRoute(message));
  client.subscribe('/message/station/wp2/end/operation/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_operation_save_results", {message: messageResponse} as ErrorResponse);
  }));
}

function requestShift() {
  ipcMain.handle("request_shift", (_event: Electron.IpcMainInvokeEvent) => {
    client?.connected && client.publish({
      destination: "/app/shift/get_info/request",
      body: "wp2",
      skipContentLengthHeader: true,
    });
  });
}

function responseShift(message: IMessage) {
  stateMain.shiftNumber = Number(message.body);
  mainWindow.webContents.send("response_shift", stateMain.shiftNumber);
}

function requestAmountBoileramountShiftMadeBoiler() {
  ipcMain.handle("request_amount_boiler", (_event: Electron.IpcMainInvokeEvent) => {
    client?.connected && client.publish({
      destination: "/app/shift/made/boiler/get_info/request",
      body: "wp2",
      skipContentLengthHeader: true,
    });
  });
}

function responseAmountBoilerShift(message: IMessage) {
  const amountMadeBoilerShift = Number(message.body);
  mainWindow.webContents.send("response_amount_made_boiler_shift", amountMadeBoilerShift);
}

function requestOperatorCode() {
  ipcMain.handle("request_operator_code", (_event: Electron.IpcMainInvokeEvent, code: number) => {
    client?.connected && client.publish({
      destination: '/app/user/get_info/request',
      body: JSON.stringify({code: code, station: "wp2"}),
      skipContentLengthHeader: true,
    });
  });
}

function responseOperatorCode(message: IMessage) {
  const user = JSON.parse(message.body);
  if ((user as UserResponse).username !== undefined) {
    stateMain.user = user;
    stateMain.isGetCode = true;
    mainWindow.webContents.send("response_operator_code", stateMain.user);
  }
}

function sendRequestComponents(serialNumber: string, allowStart = false) {
  mainWindow.webContents.send("response_wait");
  const componentsRequest = createRequestComponents(serialNumber, allowStart);
  client?.connected && client.publish({
    destination: '/app/station/start/operation/request',
    body: JSON.stringify(componentsRequest),
    skipContentLengthHeader: true,
  });
}

serialNumberEvent.on("send_serial_number", (serialNumber: string) => {
  sendRequestComponents(serialNumber);
});

function responseComponents(message: IMessage) {
  const componentsResponse: ComponentsResponse = JSON.parse(message.body);
  stateMain.isRunCycle = true;
  mainWindow.webContents.send("response_components", componentsResponse);
}

function responseError(message: IMessage, sender: (message: string) => void) {
  const messageStr: string = message.body;
  log.error("Ошибка при обмене данными с сервером", messageStr);
  sender(messageStr);
}

function responseErrorRoute(message: IMessage) {
  const boilerErrorRoute: ComponentsErrorRoute = JSON.parse(message.body);
  console.log(boilerErrorRoute);
  log.error("Ошибка при обмене данными с сервером", boilerErrorRoute.error);
  mainWindow.webContents.send("response_components", boilerErrorRoute);
}

function resetShift(message: IMessage) {
  const shiftNumber = Number(message.body);
  mainWindow.webContents.send("response_shift", shiftNumber);
}

function requestUserAuthorization() {
  ipcMain.handle("request_user_authorization", (_event: Electron.IpcMainInvokeEvent, userAuthorization: UserRequestAuthorization) => {
    client?.connected && client.publish({
      destination: '/app/user/authorization/request',
      body: JSON.stringify(userAuthorization),
      skipContentLengthHeader: true,
    });
  });
}

function responseUserAuthorization(message: IMessage) {
  const user = JSON.parse(message.body);
  if ((user as UserResponse).username !== undefined) {
    mainWindow.webContents.send("response_user_authorization", user);
  }
}

function requestLastOperation() {
  ipcMain.handle("request_last_operation_after_close", (_event: Electron.IpcMainInvokeEvent) => {
    client?.connected && client.publish({
      destination: '/app/station/start/operation/get/last/request',
      body: "wp2",
      skipContentLengthHeader: true,
    });
  });
}

function requestSerialNumberAllowStart() {
  ipcMain.handle("request_serial_number_allow_start", (_event: Electron.IpcMainInvokeEvent, serialNumber: string) => {
    sendRequestComponents(serialNumber, true);
  });
}

function requestInterruptedOperation() {
  ipcMain.handle("request_interrupted_operation", (_event: Electron.IpcMainInvokeEvent, interruptedOperation: InterruptedRequest) => {
    interruptedOperation.stationName = "wp2";
    client?.connected && client.publish({
      destination: '/app/station/interrupted/operation/request',
      body: JSON.stringify(interruptedOperation),
      skipContentLengthHeader: true,
    });
  });
}

function responseInterruptedOperation(message: IMessage) {
  const errorMessage = message.body;
  mainWindow.webContents.send("response_interrupted_operation", {message: errorMessage} );
}

function requestSaveResultComponents() {
  ipcMain.handle("request_operation_save_results", (_event: Electron.IpcMainInvokeEvent, componentsResult: ComponentsResultRequest) => {
    componentsResult.stationName = "wp2";
    client?.connected && client.publish({
      destination: '/app/station/end/operation/request',
      body: JSON.stringify(componentsResult),
      skipContentLengthHeader: true,
    });
  });
}

function responseSaveResultComponents(message: IMessage) {
  const wpResponse = JSON.parse(message.body);
  if ((wpResponse as WpResponse).amountBoilerShiftMade !== undefined) {
    mainWindow.webContents.send("response_operation_save_results", wpResponse);
    mainWindow.webContents.send("response_amount_made_boiler_shift", wpResponse.amountBoilerShiftMade);
    return;
  }
  mainWindow.webContents.send("response_operation_save_results",  {message: "Ошибка"});
}

function responseLastOperation(message: IMessage) {
  let componentsResponse: ComponentsResponse | string;
  try {
    componentsResponse = JSON.parse(message.body);
  } catch (error) {
    componentsResponse = message.body;
  }
  if ((componentsResponse as ComponentsResponse).boilerTypeCycle !== undefined) {
    stateMain.isRunCycle = true;
  }
  mainWindow.webContents.send("response_last_operation_after_close", componentsResponse);
}
