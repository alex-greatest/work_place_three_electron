import { Flex, Paper } from "@mantine/core";
import ServerIndicator from "./components/indication/ServerIndicator";
import MessageHelper from "./components/main/MessageHelper";
import { useSignal, useSignalEffect } from "@preact/signals-react";
import { useContext, useEffect, useRef } from "react";
import { context } from "./main";
import MainTabs from "./components/MainTabs";
import ScannerIndicator from "./components/indication/ScannerIndicator";
import UserAuthorization from "./components/main/UserAuthorization";
import { showError } from "./service/notification";
import Loading from "./components/Loading";

export default function App() {
  const contextApp = useContext<StoreApp>(context);
  const shift = contextApp.stateApp.shift;
  const amountBoilerShift = contextApp.stateApp.amountBoilerShift;
  const textHelper = contextApp.stateApp.textHelper;
  const isGetCode = contextApp.stateApp.isGetCode;
  const isExchangeServer = contextApp.stateApp.isExchangeServer;
  const isServerConnected = contextApp.stateApp.isServerConnected;
  const isRunCycle = contextApp.stateApp.isRunCycle;
  const actualScannedComponent = contextApp.stateApp.actualScannedComponent;
  const isWaitNewCycleStart = contextApp.stateApp.isWaitNewCycleStart;
  const stateResult = contextApp.stateApp.stateResult;
  const isNotResposenSaveResult = contextApp.stateApp.isNotResposenSaveResult;
  const isErorrSaveResults = contextApp.stateApp.isErorrSaveResults;
  const componentsResponse = contextApp.stateApp.componentsResponse;
  const isRequestLastPart = useSignal(false);
  const isLoadingLastPart = useSignal(false);
  const isWaitRequstLastPart = useRef<NodeJS.Timeout | null>(null);

  useSignalEffect(() => {
    if (isErorrSaveResults.value) {
      textHelper.value = "Не удалось сохранить результат. Ошибка. Повотирите попытку";
      return;
    }
    if (isExchangeServer.value) {
      textHelper.value = "Передача данных серверу...";
      return;
    }
    if (!isGetCode.value) {
      textHelper.value = "Введите код оператора";
      return;
    }
    if (isNotResposenSaveResult.value) {
      textHelper.value = "Не удалось сохранить результат. Нет ответа от сервера. Повотирите попытку";
      return;
    }
    if (isWaitNewCycleStart.value) {
      textHelper.value = `Результат: ${stateResult.value}. Отсканируйте серийный номер котла для продолжения`;
      return;
    }
    if (isRunCycle.value && actualScannedComponent.value.id !== 0) {
      textHelper.value = `Отсканируйте компонент: ${actualScannedComponent.value.componentType.name}`;
      return;
    }
    if (isGetCode.value) {
      textHelper.value = "Отсканируйте серийный номер котла";
      return;
    }
  })

  useSignalEffect(() => {
    if (isServerConnected.value && !isRequestLastPart.value && !isLoadingLastPart.value ) {
      window.exchangeServerAPI.requestGetLastPartAfterClose();
      isLoadingLastPart.value = true;
      isWaitRequstLastPart.current = setTimeout(() => {
        isRequestLastPart.value = false;
        isLoadingLastPart.value = false;
        isWaitRequstLastPart.current = null;
      }, 10000);
    }
  })

  function responseShift(_event: Electron.IpcRendererEvent, shiftResponse: number | ErrorResponse) {
    if ((shiftResponse as ErrorResponse).message !== undefined) {
      showError("response_shift", (shiftResponse as ErrorResponse).message);
      return;
    }
    shift.value = shiftResponse as number;
  }

  function responseAmountBoilerShift(_event: Electron.IpcRendererEvent, amountBoilerShiftResponse: number | ErrorResponse) {
    if ((amountBoilerShiftResponse as ErrorResponse).message !== undefined) {
      showError(
        "response_amount_boiler_shift",
        (amountBoilerShiftResponse as ErrorResponse).message
      );
      return;
    }
    amountBoilerShift.value = amountBoilerShiftResponse as number;
  }

  function responseLastPart(_event: Electron.IpcRendererEvent, componentsResponseServer: ComponentsResponse | ComponentsErrorRoute) {
    isWaitRequstLastPart.current && clearTimeout(isWaitRequstLastPart.current);
    isWaitRequstLastPart.current = null;
    isLoadingLastPart.value = false;
    isRequestLastPart.value = true;
    if ((componentsResponseServer as ComponentsResponse).boilerTypeCycle !== undefined) {
      componentsResponse.value = componentsResponseServer as ComponentsResponse;
      isRunCycle.value = true;
      return;
    }
  }

  useEffect(() => {
    const removeListenerShift = window.exchangeServerAPI.onResponseShift(responseShift);
    const removeListenerAmountBoilerShift = window.exchangeServerAPI.onResponseAmountBoiler(responseAmountBoilerShift);
    const removeListenerResponseLastPart = window.exchangeServerAPI.onResponseLastPart(responseLastPart);
    console.log('sdasd');
    return () => {
      removeListenerShift();
      removeListenerAmountBoilerShift();
      removeListenerResponseLastPart();
      isWaitRequstLastPart.current && clearTimeout(isWaitRequstLastPart.current);
      isWaitRequstLastPart.current = null;
    };
  }, []);

  return (
    <>
     <Flex
          direction="column"
          style={{ width: "100%", height: "100vh", padding: "1em" }}
          gap={"1em"}
        >
          <Flex align="center" style={{ width: "100%", height: "5%" }} gap={"1em"}>
            <ServerIndicator />
            <ScannerIndicator />
            <UserAuthorization />
          </Flex>
          <Paper
            p={0}
            withBorder
            shadow="xl"
            style={{ width: "100%", height: "85%" }}
          >
            {isLoadingLastPart.value ? <Loading /> : <MainTabs />}
          </Paper>
          <MessageHelper />
        </Flex>
    </>
  );
}
