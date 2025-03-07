import { Flex } from "@mantine/core";
import GreenLamp from "../../../assets/GreenLamp.png";
import RedLamp from "../../../assets/RedLamp.png";
import { useContext, useEffect } from "react";
import { context } from "../../main";

export default function ScannerIndicator() {
  const contextApp = useContext<StoreApp>(context);
  const scannerConnected = contextApp.stateApp.isScannerConnected;

  function changeScannerConnection(_event: Electron.IpcRendererEvent,value: boolean) {
    scannerConnected.value = value;
  }

  useEffect(() => {
    const removeListenerScannerState =
      window.exchangeScanner.onUpdateConnectionScannerState(
        changeScannerConnection
      );
    return () => {
      removeListenerScannerState();
    };
  }, []);

  return (
    <Flex align="center">
      <p style={{ fontSize: "21px" }}> Сканер </p>
      <img
        src={scannerConnected.value ? GreenLamp : RedLamp}
        style={{ width: "55px" }}
        alt="индикатор"
      />
    </Flex>
  );
}
