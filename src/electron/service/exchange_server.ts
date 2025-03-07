import { Client, IStompSocket, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import { canbanEvent, stateMain } from '../utils/state.js';

let mainWindow: BrowserWindow;
let timerPrintedError: NodeJS.Timeout | null = null;

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
      body: "wp1",
      skipContentLengthHeader: true,
    });
    client?.connected && client.publish({
      destination: "/app/shift/get_info/request",
      body: "wp1",
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
  requestPrint(client);
  requestBoilerHistory();
  requestBoilerHistoryManual();
  requestUserAuthorization();
  requestLastBoilerOrder();
}

export function disconnectServer() {
  if (client?.connected) {
    client.deactivate({force: true});
  }
}

function subscribe(client: Client) {
  client.subscribe('/message/wp1/user/get_info/response', (message) => responseOperatorCode(message));
  client.subscribe('/message/wp1/shift/get_info/response', (message) => responseShift(message));
  client.subscribe('/message/boiler/order/get/response', (message) => responseBoilerOrder(message));
  client.subscribe('/message/boiler/order/add/response', (message) => responseUniqueBoilerOrder(message));
  client.subscribe('/message/current/shift', (message) => resetShift(message));
  client.subscribe('/message/wp1/shift/amount/made/boiler/get_info/response', (message) => responseAmountBoilerShift(message));
  client.subscribe('/message/boiler/wp1/print/response', (message) => responsePrint(message));
  client.subscribe('/message/boiler/history/get_info/response', (message) => responseBoilerHistory(message));
  client.subscribe('/message/boiler/history/manual/get_info/response', (message) => responseBoilerHistoryManual(message));
  client.subscribe('/message/wp1/user/authorization/response', (message) => responseUserAuthorization(message));
  client.subscribe('/message/boiler/order/last/get/response', (message) => responseLastBoilerOrder(message));
}

function subscribeError(client: Client) {
  client.subscribe('/message/wp1/user/get_info/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_operator_code", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp1/shift/get_info/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_shift", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/boiler/order/get/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_boiler_order", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp1/shift/amount/made/boiler/get_info/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_amount_made_boiler_shift", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/boiler/wp1/print/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_print_server", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/boiler/history/get_info/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_boiler_history", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/boiler/history/manual/get_info/errors', (message) => responseError(message, (messageResponse: string) => {  
    mainWindow.webContents.send("response_boiler_history_manual", {message: messageResponse} as ErrorResponse);
  }));
  client.subscribe('/message/wp1/user/authorization/errors', (message) => responseError(message, (messageResponse: string) => {
    mainWindow.webContents.send("response_user_authorization", {message: messageResponse} as ErrorResponse);
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
      body: "wp1",
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
      body: "wp1",
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
      body: JSON.stringify({code: code, station: "wp1"}),
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

canbanEvent.on("send_boiler", (canbanRequest: Canban) => {
  mainWindow.webContents.send("request_boiler_order", true);
  client?.connected && client.publish({
    destination: '/app/boiler/order/get/request',
    body: JSON.stringify(canbanRequest),
    skipContentLengthHeader: true,
  });
});


canbanEvent.on("send_unique_boiler", (boilerIdUniqueRequest: BoilerIdUniqueRequest) => {
  mainWindow.webContents.send("request_boiler_order", true);
  client?.connected && client.publish({
    destination: '/app/boiler/order/add/request',
    body: JSON.stringify(boilerIdUniqueRequest),
    skipContentLengthHeader: true,
  });
});

function responseBoilerOrderUi(boilerOrder: BoilerOrder) {
  stateMain.isGetBoilerOrder = true;
  stateMain.isGetUniqueBoilerOrder = true;
  stateMain.boilerOrder = boilerOrder;
  console.log(boilerOrder);
  mainWindow.webContents.send("response_boiler_order", stateMain.boilerOrder);
  mainWindow.webContents.send("response_amount_boiler_printer_order", stateMain.boilerOrder.amountBoilerPrint);
}

function responseBoilerOrder(message: IMessage) {
  const boilerOrder: BoilerOrder = JSON.parse(message.body);
  responseBoilerOrderUi(boilerOrder);
}

function responseUniqueBoilerOrder(message: IMessage) {
  const boilerOrder: BoilerOrder = JSON.parse(message.body);
  if (boilerOrder.isDataExists) {
    responseBoilerOrderUi(boilerOrder);
    return;
  }
  stateMain.isGetUniqueBoilerOrder = true;
  stateMain.boilerOrder.id = boilerOrder.id;
  stateMain.boilerOrder.dateScan = boilerOrder.dateScan;
  mainWindow.webContents.send("response_unique_id_boiler_order", stateMain.boilerOrder);
}

function responseError(message: IMessage, sender: (message: string) => void) {
  const messageStr: string = message.body;
  log.error("Ошибка при обмене данными с сервером", messageStr);
  sender(messageStr);
}

function resetShift(message: IMessage) {
  const shiftNumber = Number(message.body);
  mainWindow.webContents.send("response_shift", shiftNumber);
}

function requestPrint(client: Client) {
  ipcMain.handle("request_printer_server", (_event: Electron.IpcMainInvokeEvent) => {
    client?.connected && client.publish({
      destination: "/app/boiler/wp1/print/request",
      body: JSON.stringify({id: stateMain.boilerOrder.id, orderCode: stateMain.boilerOrder.orderNumber, userCode: stateMain.user.code, 
        numberShift: stateMain.shiftNumber}),
      skipContentLengthHeader: true,
    });
  });
}

function responsePrint(message: IMessage) {
  const boiler: Boiler = JSON.parse(message.body);
  if (stateMain.isPrinterConnected) {
    timerPrintedError = setTimeout(() => {
      log.error("Нет ответа от принтера. Не удалось распечатать этикетку");
      mainWindow.webContents.send("response_print_server", {message: "Не удалось распечатать этикетку"} as ErrorResponse);
      timerPrintedError = null;
    }, 10000);
    canbanEvent.emit("run_print", boiler);
    return; 
  }
  log.error("Ошибка при отправке данных на печать. Принтер не подключен");
  mainWindow.webContents.send("response_print_server", {message: "Нет связи с принтером печать невозможно"} as ErrorResponse);
}

canbanEvent.on("printer_response", (boiler: Boiler) => {
  timerPrintedError && clearTimeout(timerPrintedError);
  timerPrintedError = null;
  mainWindow.webContents.send("response_amount_made_boiler_shift", boiler.amountBoilerShift);
  mainWindow.webContents.send("response_print_server", boiler);
});

function requestBoilerHistoryServer(id: string, pageNumber: number, destinationResponse: string, destinationResponseError: string) {
  const boilerRequest: BoilerHistoryRequest = {
    id: id, 
    page: pageNumber,
    size: 10,
    destinationResponse,
    destinationResponseError
  };
  client?.connected && client.publish({
    destination: '/app/boiler/list/get_info/request',
    body: JSON.stringify(boilerRequest),
    skipContentLengthHeader: true,
  });
}

function requestBoilerHistory() {
  ipcMain.handle("request_boiler_history", (_event: Electron.IpcMainInvokeEvent, pageNumber: number) => {
    if (stateMain.boilerOrder.id && stateMain.boilerOrder.id.trim().length === 0) {
      log.error("Не удалось получить историю заказа. Заказ ещё не выбран");
      return;
    }
    requestBoilerHistoryServer(stateMain.boilerOrder.id, pageNumber, '/message/boiler/history/get_info/response', '/message/boiler/history/get_info/errors');
  });
}

function requestBoilerHistoryManual() {
  ipcMain.handle("request_boiler_history_manual", (_event: Electron.IpcMainInvokeEvent, id: string, pageNumber: number) => {
    if (!id && id.trim().length > 0) {
      log.error("Не удалось получить историю заказа. Пустой иденктификатор");
      return;
    }
    requestBoilerHistoryServer(id, 
      pageNumber, 
      '/message/boiler/history/manual/get_info/response', 
      '/message/boiler/history/manual/get_info/errors');
  });
}

function responseBoilerHistory(message: IMessage) {
  const boilerPage: BoilerPage = JSON.parse(message.body);
  mainWindow.webContents.send("response_boiler_history", boilerPage);
}

function responseBoilerHistoryManual(message: IMessage) {
  const boilerPage: BoilerPage = JSON.parse(message.body);
  mainWindow.webContents.send("response_boiler_history_manual", boilerPage);
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

function responseLastBoilerOrder(message: IMessage) {
  const boilerOrder: BoilerOrder = JSON.parse(message.body);
  stateMain.boilerOrder = boilerOrder;
  mainWindow.webContents.send("response_last_boiler_order", boilerOrder);
  mainWindow.webContents.send("response_amount_boiler_printer_order", stateMain.boilerOrder.amountBoilerPrint);
}