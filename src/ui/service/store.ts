import { signal } from "@preact/signals-react";

export function createAppStore(): StoreApp {
  const stateApp: StateRender = ({
    user: signal<UserResponse>({username: "", code: 0, roleDto: {name: ""}}),
    userAuthorization: signal<UserResponse>({username: "", code: 0, roleDto: {name: ""}}),
    isServerConnected: signal<boolean>(false),
    isScannerConnected: signal<boolean>(false),
    isPrinterConnected: signal<boolean>(false),
    isGetCode: signal<boolean>(false), 
    textHelper: signal<string>("Введите код оператора"),
    boilerOrder: signal<BoilerOrder>({ id: "", isDataExists: false, orderNumber: 0, article: "", amountBoilerOrder: 0,
       amountBoilerPrint: 0, codeScan: "",  dateScan: "" }),
    isGetUniqueBoilerOrder: signal<boolean>(false),
    isGetBoilerOrder: signal<boolean>(false),
    isPrinting: signal<boolean>(false),
    isLoadingBoilerOrder: signal<boolean>(false),
    boiler: signal<Boiler>({serialNumber: "", amountBoilerPrint: 0, amountBoilerShift: 0}),
    amountBoilerPrinted: signal<number>(0),
    currentSendAmountPrintedBarcode: signal<number>(0),
    amountSendPrintedBarcode: signal<number>(1),
    isUpdatedPrinterHistory: signal<boolean>(false),
    isUserAuthorization: signal<boolean>(false),
    shift: signal<number>(0),
    amountBoilerShift: signal<number>(0)
    
  });

  return { stateApp };
}
