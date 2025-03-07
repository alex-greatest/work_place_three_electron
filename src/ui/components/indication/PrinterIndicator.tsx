import { Flex } from "@mantine/core";
import GreenLamp from "../../../assets/GreenLamp.png";
import RedLamp from "../../../assets/RedLamp.png";
import { useContext, useEffect } from "react";
import { context } from "../../main";

export default function PrinterIndicator() {
  const contextApp = useContext<StoreApp>(context);
  const printerConnected = contextApp.stateApp.isPrinterConnected;

  function changePrinterConnection(_event: Electron.IpcRendererEvent,value: boolean) {
    printerConnected.value = value;
  }

  useEffect(() => {
    const removeListenerPrinterState = window.exchangePrinter.onUpdateConnectionPrinterState(changePrinterConnection);
    return () => {
      removeListenerPrinterState();
    };
  }, []);

  return (
    <Flex align="center">
      <p style={{ fontSize: "21px" }}> Принтер </p>
      <img
        src={printerConnected.value ? GreenLamp : RedLamp}
        style={{ width: "55px" }}
        alt="индикатор"
      />
    </Flex>
  );
}
