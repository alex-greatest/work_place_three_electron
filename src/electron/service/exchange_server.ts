import { Client, IStompSocket, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import { serialNumberEvent, stateMain } from '../utils/state.js';

let mainWindow: BrowserWindow;

const client = new Client({
  brokerURL: 'ws://localhost:8080/ws',
  debug: function (str) {
    console.log(str);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

export function connect(_mainWindow: BrowserWindow) {
  mainWindow = _mainWindow
  client.webSocketFactory = function () {
    // Note that the URL is different from the WebSocket URL
    return new SockJS('http://localhost:8080/ws') as IStompSocket;
  };
  client.onConnect = function (_) {
    mainWindow.webContents.send("updater_connection_server_state", true);
    stateMain.isServerConnected = true;
    subscribe(client);
    subscribeError(client);
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
  requestAmountBoileramountShiftMadeBoiler(client);
  requestShift(client);
  requestOperatorCode(client);
  requestUserAuthorization();
  requestLastBoilerOrder();
}

export function disconnectServer() {
  if (client?.connected) {
    client.deactivate({force: true});
  }
}

function subscribe(client: Client) {
  client.subscribe('/message/wp2/user/get_info/response', (message) => responseOperatorCode(message));
  client.subscribe('/message/wp2/user/authorization/response', (message) => responseUserAuthorization(message));
  client.subscribe('/message/wp2/shift/get_info/response', (message) => responseShift(message));
  client.subscribe('/message/wp2/shift/amount/made/boiler/get_info/response', (message) => responseAmountBoilerShift(message));
  client.subscribe('/message/station/wp2/operation/response', (message) => responseComponents(message));

  client.subscribe('/message/current/shift', (message) => resetShift(message));
}

function subscribeError(client: Client) {
  client.subscribe('/message/wp2/user/get_info/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_operator_code", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp2/shift/get_info/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_shift", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp2/shift/amount/made/boiler/get_info/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_amount_made_boiler_shift", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/boiler/wp2/print/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_print_server", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp2/user/authorization/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_user_authorization", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/station/wp2/operation/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_components", {message: messageResponse} as ErrorResponse);
  }));





  client.subscribe('/message/boiler/history/get_info/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_boiler_history", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/boiler/history/manual/get_info/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_boiler_history_manual", {message: messageResponse} as ErrorResponse);
  }));

  client.subscribe('/message/boiler/order/add/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_unique_id_boiler_order", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/boiler/order/last/get/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_last_boiler_order", {message: messageResponse} as ErrorResponse);
  }));
}

function requestShift(client: Client) {
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

function requestAmountBoileramountShiftMadeBoiler(client: Client) {
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

function requestOperatorCode(client: Client) {
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

serialNumberEvent.on("send_serial_number", (serialNumber: string) => {
  const boilerRequest: BoilerRequestWpTwo = {
    numberShift: stateMain.shiftNumber,
    userCode: stateMain.user.code,
    serialNumber: serialNumber,
    stationName: "wp2",
    prevStationName: "wp1",
    isAllowStart: false
  };
  client?.connected && client.publish({
    destination: '/app/station/wp2/start/operation/request',
    body: JSON.stringify(boilerRequest),
    skipContentLengthHeader: true,
  });
});

function responseComponents(message: IMessage) {
  const boilerResponseWpTwo: BoilerResponseWpTwo = JSON.parse(message.body);
  stateMain.isGetBoilerResponseWpTwo = true;
  mainWindow.webContents.send("response_components", boilerResponseWpTwo);
}

function responseError(message: IMessage, sender: (message: string) => void) {
  const messageStr: string = message.body;
  log.error("Ошибка при обмене данными с сервером", messageStr);
  sender(messageStr);
}

function resetShift(message: IMessage) {
  console.log("dasda1wwwww");
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

function requestLastBoilerOrder() {
  ipcMain.handle("request_last_boiler_order_after_close", (_event: Electron.IpcMainInvokeEvent) => {
    client?.connected && client.publish({
      destination: '/app/boiler/order/last/get/request',
      body: "",
      skipContentLengthHeader: true,
    });
  });
}
