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

interface BoilerTypeCycleStation {
  typeName: string;
  article: string;
  serialNumber: string;
}

interface UserRequestAuthorization {
  login: string;
  password: string;
  station: string;
}

interface Components {
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

interface ComponentsResponse {
  boilerTypeCycle: BoilerTypeCycleStation;
  componentSetDtoList: ComponentSetDto[];
  componentBindingResponses: ComponentBindingResponse[];
}

interface ComponentsErrorRoute {
  error: string;
  serialNumber: string;
  isRouteError: boolean;
}

interface InterruptedRequest {
  serialNumber: string;
  stationName: string;
  message: string;
}

interface ComponentsResult {
  componentType: ComponentTypeDto,
  scannedValue: string;
  status: string;
}

interface ComponentsResultRequest {
  componentsResult: ComponentsResult[];
  stationName: string;
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
type callbackComponentsResponse = (_event: Electron.IpcRendererEvent, componentsResponse: ComponentsResponse |ComponentsErrorRoute) => void;
type callbackErrorResponse = (_event: Electron.IpcRendererEvent, error: ErrorResponse) => void;
type callbackErrorResponseString = (_event: Electron.IpcRendererEvent, error: ErrorResponse | string) => void;

interface IExchangeServerAPI {
  requestGetLastBoilerOrderAfterClose: () => void;
  onUpdateConnectionServerState: (callback: callbackBoolean) => () => void;
  requestOperatorCode: (code: number) => void;
  onResponseOperatorCode: (callback: callbackUserResponse) => () => void;
  onResponseShift: (callback: callbackShiftResponse) => () => void;
  onResponseComponents: (callback: callbackComponentsResponse) => () => void;
  onResponseUserAuthorization: (callback: callbackUserResponse) => () => void;
  requestUserAuthorization: (userRequestAuthorization: UserRequestAuthorization) => void;
  requestSerialNumberAllowStart: (serialNumber: string) => void; 
  onResponseLastBoiierOrder: (callback: callbackCanban) => () => void;
  onResponseAmountBoiler: (callback: callbackShiftResponse) => () => void;
  onResponseWait: (callback: callbackEmpty) => () => void;
  requestUserAuthorization: (userRequestAuthorization: UserRequestAuthorization) => void;
  requestInterruptedOperation: (interruptedRequest: InterruptedRequest) => void;
  onResponseInterruptedOperation: (callback: callbackErrorResponse) => () => void;
  requestSaveResultComponents: (componentsResult: ComponentsResult[]) => void;
  onResponseSaveResultComponents: (callback: callbackErrorResponseString) => () => void;
}

interface IExchangeScanner {
  onUpdateConnectionScannerState: (callback: callbackBoolean) => () => void;
  onResponseScanError: (callback: callbackString) => () => void;
  requestScanManual: (isScan: boolean) => () => void;
  requestScannedComponentsAllowed: (isScan: boolean) => () => void;
  onResponseScanСomponents: (callback: callbackString) => () => void;
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
  isGetComponentsResponse: Signal<boolean>;
  componentsResponse: Signal<ComponentsResponse>;
  isUserAuthorization: Signal<boolean>;
  shift: Signal<number>,
  amountBoilerShift: Signal<number>
  isExchangeServer: Signal<boolean>;
  isRunCycle: Signal<boolean>;
  isInizializeRunCycle: Signal<boolean>;
  componenstResult: Signal<ComponentsResult[]>;
  componenstResultRequest: Signal<ComponentsResult[]>;
  actualScannedComponent: Singal<ComponentBindingResponse>;
  actualResultComponent: Singal<ComponentsResult>;
  actualNumberBindingComponent: Signal<number>;
  amountBindingComponent: Signal<number>;
}

interface StateMain {
  user: UserResponse;
  shiftNumber: number;
  isServerConnected: boolean;
  isScannerConnected: boolean;
  isGetCode: boolean;
  isScannedComponentsAllowed: boolean;
  isRunCycle: boolean;
}

