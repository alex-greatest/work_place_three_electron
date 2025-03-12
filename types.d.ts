type ErrorResponse = {
  message: string;
}

type UserResponse = {
  username: string;
  code: number;
  roleDto: {
    name: string;
  };
};

interface Shift {
  number: number;
  timeStart: string;
  timeEnd: string;
}

interface BoilerTypeCycle {
  typeName: string;
  article: string;
}

interface UserRequestAuthorization {
  login: string;
  password: string;
  station: string;
}

interface BoilerRequestWpTwo {
  numberShift: number;
  userCode: number;
  serialNumber: string;
  stationName: string;
  prevStationName: string;
  isAllowStart: boolean;
}

interface ComponentTypeDto {
  id: number;
  name: string;
}

interface ComponentSetDto {
  id: number;
  componentType: ComponentTypeDto;
  value: string;
}

interface ComponentBindingResponse {
  id: number;
  componentType: ComponentTypeDto;
  order: number;
}

interface BoilerTypeStation {
  id: number;
  typeName: string;
  article: string;
}

interface BoilerResponseWpTwo {
  boilerTypeStation: BoilerTypeStation;
  componentSetDtoList: ComponentSetDto[];
  componentBindingResponses: ComponentBindingResponse[];
}

interface BoilerErrorRoute {
  error: string;
  isRouteError: boolean;
}

type callbackBoolean = (_event: Electron.IpcRendererEvent, value: boolean) => void;
type callbackUserResponse = (_event: Electron.IpcRendererEvent, userResponse: UserResponse|ErrorResponse) => void;
type callbackShiftResponse = (_event: Electron.IpcRendererEvent, shiftNumber: number|ErrorResponse) => void;
type callbackBoilerOrder = (_event: Electron.IpcRendererEvent, boilerOrder: BoilerOrder|ErrorResponse) => void;
type callbackState = (_event: Electron.IpcRendererEvent, state: typeof StateApp ) => void;
type callbackString = (_event: Electron.IpcRendererEvent, value: string) => void;
type callbackAmountOrderPrintedResponse = (_event: Electron.IpcRendererEvent, shiftNumber: number) => void;
type callbackBoilerResponse = (_event: Electron.IpcRendererEvent, boiler: Boiler|ErrorResponse) => void;
type callbackBoilerHistory = (_event: Electron.IpcRendererEvent, boilers: BoilerPage|ErrorResponse) => void;
type callbackBooleanError = (_event: Electron.IpcRendererEvent, error: boolean, errorMessage: string) => void;
type callbackNumber = (_event: Electron.IpcRendererEvent, value: number) => void;
type callbackUserAuthorization = (_event: Electron.IpcRendererEvent, userRequestAuthorization: UserRequestAuthorization) => void;
type callbackEmpty = (_event: Electron.IpcRendererEvent) => void;
type callbackBoilerResponseWpTwo = (_event: Electron.IpcRendererEvent, boilerResponseWpTwo: BoilerResponseWpTwo|BoilerErrorRoute) => void;

interface IExchangeServerAPI {
  requestGetLastBoilerOrderAfterClose: () => void;
  onUpdateConnectionServerState: (callback: callbackBoolean) => () => void;
  requestOperatorCode: (code: number) => void;
  onResponseOperatorCode: (callback: callbackUserResponse) => () => void;
  onResponseShift: (callback: callbackShiftResponse) => () => void;
  onResponseComponents: (callback: callbackBoilerResponseWpTwo) => () => void;
  onResponseUserAuthorization: (callback: callbackUserResponse) => () => void;
  requestUserAuthorization: (userRequestAuthorization: UserRequestAuthorization) => void;
  requestComponents: (serialN) 


  onResponseUniqueIdBoiierOrder: (callback: callbackBoilerOrder) => () => void;
  onResponseLastBoiierOrder: (callback: callbackCanban) => () => void;
}

interface IExchangeScanner {
    onUpdateConnectionScannerState: (callback: callbackBoolean) => () => void;
    onResponseScanError: (callback: callbackString) => () => void;
    requestScanManual: (isScan: boolean) => () => void;
    onResponseComponentsWait: (callback: callbackEmpty) => () => void;
}

interface ISyncState {
  requestMainStateReset: () => void;
  requestOperatorCodeReset: () => void;
  requestChangeTypeLabel: (typeLabel: string) => void;
}

interface Window {
  exchangeServerAPI: IExchangeServerAPI;
  exchangeScanner: IExchangeScanner;
  syncState: ISyncState;
}

interface StoreApp {
  stateApp: StateRender;
}

interface StateRender {
  user: Singnal<UserResponse>;
  userAuthorization: Singnal<UserResponse>;
  isServerConnected: Signal<boolean>;
  isScannerConnected: Signal<boolean>;
  isPrinterConnected: Signal<boolean>;
  textHelper: Signal<string>;
  isGetCode: Signal<boolean>;
  isGetBoilerResponseWpTwo: Signal<boolean>;
  boilerResponseWpTwo: Signal<BoilerResponseWpTwo>;
  isUserAuthorization: Signal<boolean>;
  shift: Signal<number>,
  amountBoilerShift: Signal<number>
  isLoadingComponents: Signal<boolean>;
}

interface StateMain {
  user: UserResponse;
  isGetCode: boolean;
  isGetBoilerResponseWpTwo: boolean;
  shiftNumber: number;
  isServerConnected: boolean;
  isScannerConnected: boolean;
  isPrinterConnected: boolean;
}

