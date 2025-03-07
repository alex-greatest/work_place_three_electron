import { Flex } from "@mantine/core";
import GreenLamp from "../../../assets/GreenLamp.png";
import RedLamp from "../../../assets/RedLamp.png";
import { useContext, useEffect } from "react";
import { context } from "../../main";

export default function ServerIndicator() {
  const contextApp = useContext<StoreApp>(context);
  const serverStateConnection = contextApp.stateApp.isServerConnected;

  function changeStateConnection(_event: Electron.IpcRendererEvent,value: boolean) {
    serverStateConnection.value = value;
  }

  useEffect(() => {
    const removeListenerServerState =
      window.exchangeServerAPI.onUpdateConnectionServerState(
        changeStateConnection
      );
    return () => {
      removeListenerServerState();
    };
  }, []);

  return (
    <Flex align="center">
      <p style={{ fontSize: "21px" }}> Сервер </p>
      <img
        src={serverStateConnection.value ? GreenLamp : RedLamp}
        style={{ width: "55px" }}
        alt="индикатор"
      />
    </Flex>
  );
}
