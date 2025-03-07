import { Flex, Paper } from "@mantine/core";
import ServerIndicator from "./components/indication/ServerIndicator";
import MessageHelper from "./components/main/MessageHelper";
import { useSignal, useSignalEffect } from "@preact/signals-react";
import { useContext, useEffect, useRef } from "react";
import { context } from "./main";
import MainTabs from "./components/MainTabs";
import ScannerIndicator from "./components/indication/ScannerIndicator";
import PrinterIndicator from "./components/indication/PrinterIndicator";
import UserAuthorization from "./components/main/UserAuthorization";
import { showError } from "./service/notification";
import Loading from "./components/Loading";

export default function App() {
  const contextApp = useContext<StoreApp>(context);
  const textHelper = contextApp.stateApp.textHelper;
  const isGetCode = contextApp.stateApp.isGetCode;
  const isGetBoilerOrder = contextApp.stateApp.isGetBoilerOrder;
  const isGetUniqueBoilerOrder = contextApp.stateApp.isGetUniqueBoilerOrder;
  const isLoadingBoilerOrder = contextApp.stateApp.isLoadingBoilerOrder;
  const isPrinting = contextApp.stateApp.isPrinting;
  const isServerConnected = contextApp.stateApp.isServerConnected;
  const amountSendPrintedBarcode = contextApp.stateApp.amountSendPrintedBarcode;
  const currentSendAmountPrintedBarcode = contextApp.stateApp.currentSendAmountPrintedBarcode;
  const isRequestLastPart = useSignal(false);
  const isLoadingLastPart = useSignal(false);
  const isWaitRequstLastPart = useRef<NodeJS.Timeout | null>(null);

  useSignalEffect(() => {
    if (isPrinting.value && isGetCode.value) {
      textHelper.value = `Печать этикеток ${currentSendAmountPrintedBarcode} из ${amountSendPrintedBarcode}`;
      return;
    }
    if (isGetBoilerOrder.value && isGetCode.value) {
      textHelper.value = "Нажмите на кнопку для печати этикеток";
      return;
    }
    if (isLoadingBoilerOrder.value && isGetCode.value) {
      textHelper.value = "Передача данных канбан-карты серверу...";
      return;
    }
    if (isGetCode.value && isGetUniqueBoilerOrder.value) {
      textHelper.value = "Отсканируйте канбан карту";
      return;
    }
    if (isGetCode.value) {
      textHelper.value = "Отсканируйте уникальный номер канбан карты";
      return;
    }
    textHelper.value = "Введите код оператора";
  })

  useSignalEffect(() => {
    if (isServerConnected.value && !isRequestLastPart.value && !isLoadingLastPart.value ) {
      window.exchangeServerAPI.requestGetLastBoilerOrderAfterClose();
      isLoadingLastPart.value = true;
      isWaitRequstLastPart.current = setTimeout(() => {
        isRequestLastPart.value = false;
        isLoadingLastPart.value = false;
        showError("response_error_last_part", "Нет ответа от сервера при запросе последнего заказа", 10000);
      }, 10000);
    }
  })

  function responseLastBoilerOrder(_event: Electron.IpcRendererEvent, boilerOrder: BoilerOrder | ErrorResponse) {
    isRequestLastPart.value = true;
    isLoadingLastPart.value = false;
    isWaitRequstLastPart.current && clearTimeout(isWaitRequstLastPart.current);
    isWaitRequstLastPart.current = null;
    if ((boilerOrder as BoilerOrder).orderNumber !== undefined) {
      isGetBoilerOrder.value = true;
      isGetUniqueBoilerOrder.value = true;
      contextApp.stateApp.boilerOrder.value = { ...boilerOrder };
      console.log(boilerOrder);
      return;
    }
    console.log(boilerOrder);
    showError("response_boiler_order_error", (boilerOrder as ErrorResponse).message);
  }

  useEffect(() => {
    const removeListenerResponseBoilerOrder = window.exchangeServerAPI.onResponseLastBoiierOrder(responseLastBoilerOrder);
    return () => {
      removeListenerResponseBoilerOrder();
    }
  }, [])

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
            <PrinterIndicator />
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
