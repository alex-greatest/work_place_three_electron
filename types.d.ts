type Statistics = {
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
};

type StaticData = {
  totalStorage: number;
  cpuModel: string;
  totalMemoryGB: number;
};

type View = "CPU" | "RAM" | "STORAGE";

type FrameWindowAction = "CLOSE" | "MAXIMIZE" | "MINIMIZE";

type EventPayloadMapping = {
  statistics: Statistics;
  getStaticData: StaticData;
  changeView: View;
  sendFrameAction: FrameWindowAction;
};

type ErrorResponse = {
  message: string;
}

type UnsubscribeFunction = () => void;

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

interface Boiler {
  serialNumber: string;
  amountBoilerPrint: number;
  amountBoilerShift: number;
}

interface BoilerIdUniqueRequest {
  userCode: number,
  id: string,
  numberShift: number
}

interface BoilerTypeCycle {
  typeName: string;
  article: string;
}

interface BoilerHistoryResponse {
  serialNumber: string;
  boilerTypeCycle: BoilerTypeCycle;
  dateCreate: string; // ISO date string
}

interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface BoilerPage {
  total: number;
  content: BoilerResponse[];
}

interface BoilerHistoryRequest {
  id: string;
  page: number;
  size: number;
  destinationResponse: string;
  destinationResponseError: string;
}

interface BoilerPage {
  content: BoilerHistoryResponse[];
  pageInfo: PageInfo;
}

interface UserRequestAuthorization {
  login: string;
  password: string;
  station: string;
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

interface IExchangeServerAPI {
  requestGetLastBoilerOrderAfterClose: () => void;
  onUpdateConnectionServerState: (callback: callbackBoolean) => () => void;
  requestOperatorCode: (code: number) => void;
  onResponseOperatorCode: (callback: callbackUserResponse) => () => void;
  onResponseShift: (callback: callbackShiftResponse) => () => void;
  onResponseBoiierOrder: (callback: callbackCanban) => () => void;
  onRequestBoilerOrder: (callback: callbackBoolean) => () => void;
  onResponseAmountBoiler: (callback: callbackShiftResponse) => () => void;
  onResponseAmountBoilerPrintedOrder: (callback: callbackAmountOrderPrintedResponse) => () => void;
  requestPrint: () => void;
  onResponsePrint: (callback: callbackPrintResponse) => () => void;
  requestBoilerHistory: (pageNumber: number) => void;
  onResponseBoilerHistory: (callback: callbackBoilerHistory) => () => void;
  requestBoilerHistoryManual: (id: string, pageNumber: number) => void;
  onResponseBoilerHistoryManual: (callback: callbackBoilerHistory) => () => void;
  requestUserAuthorization: (userRequestAuthorization: UserRequestAuthorization) => void;
  onResponseUserAuthorization: (callback: callbackUserResponse) => () => void;
  onResponseUniqueIdBoiierOrder: (callback: callbackBoilerOrder) => () => void;
  onResponseLastBoiierOrder: (callback: callbackCanban) => () => void;
}

interface IExchangeScanner {
    onUpdateConnectionScannerState: (callback: callbackBoolean) => () => void;
    onResponseScanError: (callback: callbackString) => () => void;
    requestScanManual: (isScan: boolean) => () => void;
    onResponseScanManual: (callback: callbackString) => () => void;
    onResponseScanManualError: (callback: callbackString) => () => void;
}

interface ISyncState {
  requestMainStateReset: () => void;
  requestOperatorCodeReset: () => void;
  requestChangeTypeLabel: (typeLabel: string) => void;
}

interface IExchangePrinter {
  onUpdateConnectionPrinterState: (callback: callbackBoolean) => () => void;
  requestOperatorCode: (code: number) => void;
  onResponseOperatorCode: (callback: callbackUserResponse) => () => void;
  onResponseShift: (callback: callbackShiftResponse) => () => void;
  onResponseBoiierOrder: (callback: callbackCanban) => () => void;
  onRequestBoilerOrder: (callback: callbackBoolean) => () => void;
  requestPrintHistory: (boilerResponse: BoilerHistoryResponse) => void;
  onResponsePrintHistory: (callback: callbackBooleanError) => () => void;
}

interface Window {
  exchangeServerAPI: IExchangeServerAPI;
  exchangeScanner: IExchangeScanner;
  exchangePrinter: IExchangePrinter;
  syncState: ISyncState;
}

interface Canban {
  id: string;
  numberOrder: number|null;
  article: string;
  amountBoilerOrder: number;
  dateScan: dayjs|null;
  code: string;
  userCode: number;
  numberShift: number;
}

interface BoilerOrder {
  id: string,
  isDataExists: boolean;
  orderNumber: number;
  article: string;
  amountBoilerOrder: number;
  amountBoilerPrint: number;
  codeScan: string;
  dateScan: string; 
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
  boilerOrder: Signal<BoilerOrder>;
  isGetUniqueBoilerOrder: Signal<boolean>;
  isGetBoilerOrder: Signal<boolean>;
  isLoadingBoilerOrder: Signal<boolean>;
  isPrinting: Signal<boolean>;
  boiler: Signal<Boiler>;
  amountBoilerPrinted: Signal<number>;
  amountSendPrintedBarcode: Signal<number>;
  currentSendAmountPrintedBarcode: Signal<number>;
  isUpdatedPrinterHistory: Signal<boolean>;
  isUserAuthorization: Signal<boolean>;
  shift: Signal<number>,
  amountBoilerShift: Signal<number>
}

interface StateMain {
  user: UserResponse;
  isGetCode: boolean;
  isGetUniqueBoilerOrder: boolean;
  boilerOrder: BoilerOrder;
  isGetBoilerOrder: boolean;
  shiftNumber: number;
  isServerConnected: boolean;
  isScannerConnected: boolean;
  isPrinterConnected: boolean;
  typelabel: string;
}
