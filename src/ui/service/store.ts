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
    isUserAuthorization: signal<boolean>(false),
    shift: signal<number>(0),
    amountBoilerShift: signal<number>(0),
    isGetComponentsResponse: signal<boolean>(false),
    componentsResponse: signal<ComponentsResponse>({boilerTypeCycle: { typeName: "", article: "", serialNumber: ""},
      componentSetDtoList: [] as ComponentSetDto[],
      componentBindingResponses: [] as ComponentBindingResponse[]}),
    isExchangeServer: signal<boolean>(false),
    isRunCycle: signal<boolean>(false),
    isInizializeRunCycle: signal<boolean>(false),
    componenstResult: signal<ComponentsResult[]>([] as ComponentsResult[]),
    componenstResultRequest: signal<ComponentsResult[]>([] as ComponentsResult[]),
    actualScannedComponent: signal<ComponentBindingResponse>({id: 0, componentType: {id: 0, name: ""}, order: 0}),
    actualNumberBindingComponent: signal<number>(0),
    amountBindingComponent: signal<number>(0),
    actualResultComponent: signal<ComponentsResult>({componentType: {id: 0, name: ""}, scannedValue: "", status: ""}),
  });

  return { stateApp };
}
