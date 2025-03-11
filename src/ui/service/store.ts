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
    isGetBoilerResponseWpTwo: signal<boolean>(false),
    boilerResponseWpTwo: signal<BoilerResponseWpTwo>({boilerTypeStation: { id: 0, typeName: "", article: ""},
      componentSetDtoList: [] as ComponentSetDto[],
      componentBindingResponses: [] as ComponentBindingResponse[]}),
    isLoadingComponents: signal<boolean>(false),
  });

  return { stateApp };
}
