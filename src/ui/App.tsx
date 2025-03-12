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
  const isServerConnected = contextApp.stateApp.isServerConnected;
  const isRequestLastPart = useSignal(false);
  const isLoadingLastPart = useSignal(false);
  const isWaitRequstLastPart = useRef<NodeJS.Timeout | null>(null);

  useSignalEffect(() => {
    if (isGetCode.value) {
      textHelper.value = "Отсканируйте серийный номер котла";
      return;
    }
    textHelper.value = "Введите код оператора";
  })

  useSignalEffect(() => {
    /*if (isServerConnected.value && !isRequestLastPart.value && !isLoadingLastPart.value ) {
      window.exchangeServerAPI.requestGetLastBoilerOrderAfterClose();
      isLoadingLastPart.value = true;
      isWaitRequstLastPart.current = setTimeout(() => {
        isRequestLastPart.value = false;
        isLoadingLastPart.value = false;
        showError("response_error_last_part", "Нет ответа от сервера при запросе последнего заказа", 10000);
      }, 10000);
    }*/
  })

  function responseShift(_event: Electron.IpcRendererEvent, shiftResponse: number | ErrorResponse
  ) {
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

  useEffect(() => {
    const removeListenerShift = window.exchangeServerAPI.onResponseShift(responseShift);
    const removeListenerAmountBoilerShift = window.exchangeServerAPI.onResponseAmountBoiler(responseAmountBoilerShift);
    return () => {
      removeListenerShift();
      removeListenerAmountBoilerShift();
    };
  }, []);

  return (
    <>
      { isLoadingLastPart.value ?
      <div style={{ height: "100vh" }}>
       <Loading />
      </div>
       : 
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
            <MainTabs />
          </Paper>
          <MessageHelper />
        </Flex>
      }
    </>
  );
}
