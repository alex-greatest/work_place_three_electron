import { Button, Flex, NumberInput, TextInput } from "@mantine/core";
import { useContext, useEffect, useRef } from "react";
import { showError } from "../../service/notification";
import { context } from "../../main";

export default function BoilerData() {
  const contextApp = useContext<StoreApp>(context);
  const timerWaitComponents = useRef<NodeJS.Timeout | null>(null);
  const isLoadingComponents = contextApp.stateApp.isLoadingComponents;
  const boilerResponseWpTwo = contextApp.stateApp.boilerResponseWpTwo;

  function responseComponentWait(_event: Electron.IpcRendererEvent) {
    isLoadingComponents.value = true;
    timerWaitComponents.current = setTimeout(() => {
      if (isLoadingComponents.value) {
        isLoadingComponents.value = false;
        showError("response_components", "Не удалось получить ответ от сервера");
      }
    }, 10000);
  }

  function responseComponent(_event: Electron.IpcRendererEvent, boilerResponseWpTwo: BoilerResponseWpTwo|ErrorResponse) {
    isLoadingComponents.value = false;
    timerWaitComponents.current && clearTimeout(timerWaitComponents.current);
    timerWaitComponents.current = null;
    if ((boilerResponseWpTwo as BoilerResponseWpTwo).boilerTypeStation !== undefined) {
      contextApp.stateApp.boilerResponseWpTwo = boilerResponseWpTwo as BoilerResponseWpTwo;
      return;
    }
    showError("response_components", (boilerResponseWpTwo as ErrorResponse).message);
  }

  useEffect(() => {
    const removeListenerOnResponseComponentWait = window.exchangeScanner.onResponseComponentsWait(responseComponentWait);
    const removeListenerOnResponseComponent = window.exchangeServerAPI.onResponseComponents(responseComponent);
    return () => {
      removeListenerOnResponseComponentWait();
      removeListenerOnResponseComponent();
      timerWaitComponents.current && clearTimeout(timerWaitComponents.current);
      timerWaitComponents.current = null;
    };
  }, []);

  return (
    <Flex style={{ width: "50%" }} gap={"0.3em"} direction={"column"}>
      <NumberInput
        rightSectionPointerEvents="none"
        label="Тип котла"
        readOnly
        value={boilerResponseWpTwo.boilerTypeStation.typeName}
      />
      <Flex gap={"1em"}>
        <TextInput
          style={{ width: "90%" }}
          rightSectionPointerEvents="none"
          label="Серийный номер котла"
          value={boilerResponseWpTwo.boilerTypeStation.article}
        />
        <Button
          style={{ width: "15%", marginTop: "1.7em" }}
          color="red"
          variant="filled"
        >
          Прервать
        </Button>
      </Flex>
    </Flex>
  );
}
