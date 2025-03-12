import { Button, Flex, TextInput, Text } from "@mantine/core";
import { useContext, useEffect, useRef } from "react";
import { showError } from "../../service/notification";
import { context } from "../../main";
import { modals } from "@mantine/modals";

export default function BoilerData() {
  const contextApp = useContext<StoreApp>(context);
  const timerWaitComponents = useRef<NodeJS.Timeout | null>(null);
  const isLoadingComponents = contextApp.stateApp.isLoadingComponents;
  const boilerResponseWpTwo = contextApp.stateApp.boilerResponseWpTwo;
  const isUserAuthorization = contextApp.stateApp.isUserAuthorization;

  const openModal = (message: string) => modals.openConfirmModal({
    title: 'Ошибка',
    centered: true,
    children: (
      <Text size="lg">
        {message}
      </Text>
    ),
    labels: { confirm: 'Продолжить', cancel: 'Отмена' },
    onCancel: () => console.log('Cancel'),
    onConfirm: () => {},
    confirmProps: {disabled: !isUserAuthorization.value, color: 'red'}
  });

  function responseComponentWait(_event: Electron.IpcRendererEvent) {
    isLoadingComponents.value = true;
    timerWaitComponents.current = setTimeout(() => {
      if (isLoadingComponents.value) {
        isLoadingComponents.value = false;
        showError("response_components", "Не удалось получить ответ от сервера");
      }
    }, 10000);
  }

  function responseComponent(_event: Electron.IpcRendererEvent, boilerResponseWpTwoResponse: BoilerResponseWpTwo|BoilerErrorRoute) {
    isLoadingComponents.value = false;
    timerWaitComponents.current && clearTimeout(timerWaitComponents.current);
    timerWaitComponents.current = null;
    if ((boilerResponseWpTwoResponse as BoilerResponseWpTwo).boilerTypeStation !== undefined) {
      boilerResponseWpTwo.value = boilerResponseWpTwoResponse as BoilerResponseWpTwo;
      return;
    } 
    checkErrorRoute(boilerResponseWpTwoResponse as BoilerErrorRoute);
  }

  function checkErrorRoute(boilerResponseWpTwoResponse: BoilerErrorRoute) {
    if (boilerResponseWpTwoResponse.isRouteError) {
      openModal(boilerResponseWpTwoResponse.error);
      return;
    }
    showError("response_components", (boilerResponseWpTwo as BoilerErrorRoute).error);
  }

  function responseScanError(_event: Electron.IpcRendererEvent, message: string) {
    showError("response_components", message, 5000);
  }

  useEffect(() => {
    const removeListenerOnResponseComponentWait = window.exchangeScanner.onResponseComponentsWait(responseComponentWait);
    const removeListenerOnResponseScannerError = window.exchangeScanner.onResponseScanError(responseScanError);
    const removeListenerOnResponseComponent = window.exchangeServerAPI.onResponseComponents(responseComponent);
    return () => {
      removeListenerOnResponseComponentWait();
      removeListenerOnResponseComponent();
      removeListenerOnResponseScannerError();
      timerWaitComponents.current && clearTimeout(timerWaitComponents.current);
      timerWaitComponents.current = null;
    };
  }, []);

  return (
    <Flex style={{ width: "50%" }} gap={"0.3em"} direction={"column"}>
      <TextInput
        rightSectionPointerEvents="none"
        label="Тип котла"
        readOnly
        value={boilerResponseWpTwo.value.boilerTypeStation.typeName}
      />
      <Flex gap={"1em"}>
        <TextInput
          style={{ width: "90%" }}
          rightSectionPointerEvents="none"
          readOnly
          label="Серийный номер котла"
          value={boilerResponseWpTwo.value.boilerTypeStation.article}
        />
        <Button
          style={{ width: "15%", marginTop: "1.7em" }}
          color="red"
          variant="filled">
          Прервать
        </Button>
      </Flex>
    </Flex>
  );
}
