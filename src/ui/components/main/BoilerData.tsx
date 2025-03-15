import { Button, Flex, TextInput, Text, Textarea, Modal } from "@mantine/core";
import { useContext, useEffect, useRef } from "react";
import { showError, showSuccess } from "../../service/notification";
import { context } from "../../main";
import { modals } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";

export default function BoilerData() {
  const contextApp = useContext<StoreApp>(context);
  const [opened, { open, close }] = useDisclosure(false);
  const timerWaitComponents = useRef<NodeJS.Timeout | null>(null);
  const timerWaitRequestInterrupted = useRef<NodeJS.Timeout | null>(null);
  const isExchangeServer = contextApp.stateApp.isExchangeServer;
  const componentsResponse = contextApp.stateApp.componentsResponse;
  const isUserAuthorization = contextApp.stateApp.isUserAuthorization;
  const isRunCycle = contextApp.stateApp.isRunCycle;
  const isGetCode = contextApp.stateApp.isGetCode;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      interruptedMessageText: "",
    },

    validate: {
      interruptedMessageText: (value: string) =>
        value.trim().length > 0 ? null : "Описание не может быть пустым",
    },
  });

  const openModal = (message: string, serialNumber: string) =>
    modals.openConfirmModal({
      title: "Ошибка",
      centered: true,
      children: <Text size="lg">{message}</Text>,
      labels: { confirm: "Продолжить", cancel: "Отмена" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () =>
        window.exchangeServerAPI.requestSerialNumberAllowStart(serialNumber),
      confirmProps: { disabled: !isUserAuthorization.value, color: "red" },
    });

  function resetState() {
    componentsResponse.value = {
      boilerTypeCycle: { typeName: "", article: "", serialNumber: "" },
      componentSetDtoList: [] as ComponentSetDto[],
      componentBindingResponses: [] as ComponentBindingResponse[],
    };
    isGetCode.value = false;
    isRunCycle.value = false;
  }

  function requestInterruptedOperation(value: string) {
    close();
    console.log(componentsResponse.value);
    const interruptedRequest: InterruptedRequest = {
      serialNumber: componentsResponse.value.boilerTypeCycle.serialNumber,
      stationName: "",
      message: value,
    };
    window.exchangeServerAPI.requestInterruptedOperation(interruptedRequest);
    isExchangeServer.value = true;
    timerWaitRequestInterrupted.current = setTimeout(() => {
      if (isExchangeServer.value) {
        isExchangeServer.value = false;
        showError("response_interrupted_operation", "Не удалось получить ответ от сервера");
      }
    }, 10000);
  }

  function responseInterruptedOperation(_event: Electron.IpcRendererEvent, errorResponse: ErrorResponse) {
    isExchangeServer.value = false;
    if (errorResponse.message.length > 0) {
      showError("response_interrupted_operation", errorResponse.message);
      return;
    }
    resetState();
    showSuccess("response_interrupted_operation", "Операция прервана", 5000);
  }

  function responseComponentWait(_event: Electron.IpcRendererEvent) {
    isExchangeServer.value = true;
    timerWaitComponents.current = setTimeout(() => {
      if (isExchangeServer.value) {
        isExchangeServer.value = false;
        showError("response_components_wait", "Не удалось получить ответ от сервера");
      }
    }, 10000);
  }

  function responseComponent(_event: Electron.IpcRendererEvent, componentsResponseServer: ComponentsResponse | ComponentsErrorRoute) {
    isExchangeServer.value = false;
    timerWaitComponents.current && clearTimeout(timerWaitComponents.current);
    timerWaitComponents.current = null;
    if ((componentsResponseServer as ComponentsResponse).boilerTypeCycle !== undefined) {
      componentsResponse.value = componentsResponseServer as ComponentsResponse;
      isRunCycle.value = true;
      return;
    }
    checkErrorRoute(componentsResponseServer as ComponentsErrorRoute);
  }

  function checkErrorRoute(componentsResponseServer: ComponentsErrorRoute) {
    if (componentsResponseServer.isRouteError) {
      openModal(componentsResponseServer.error,componentsResponseServer.serialNumber);
      return;
    }
    showError("response_components", componentsResponseServer.error);
  }

  function responseScanError(_event: Electron.IpcRendererEvent,message: string) {
    showError("response_scan_error", message, 5000);
  }

  useEffect(() => {
    const removeListenerOnResponseComponentWait =
      window.exchangeServerAPI.onResponseWait(responseComponentWait);
    const removeListenerOnResponseScannerError =
      window.exchangeScanner.onResponseScanError(responseScanError);
    const removeListenerOnResponseComponent =
      window.exchangeServerAPI.onResponseComponents(responseComponent);
    const removeListenerOnResponseInterruptedOperation =
      window.exchangeServerAPI.onResponseInterruptedOperation(
        responseInterruptedOperation
      );
    return () => {
      removeListenerOnResponseComponentWait();
      removeListenerOnResponseComponent();
      removeListenerOnResponseScannerError();
      removeListenerOnResponseInterruptedOperation();
      timerWaitComponents.current && clearTimeout(timerWaitComponents.current);
      timerWaitRequestInterrupted.current &&
        clearTimeout(timerWaitRequestInterrupted.current);
      timerWaitComponents.current = null;
      timerWaitRequestInterrupted.current = null;
    };
  }, []);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Прерывание операции"
        size={"md"}
        withCloseButton={true}
        centered
      >
        <form
          onSubmit={form.onSubmit((values) =>
            requestInterruptedOperation(values.interruptedMessageText)
          )}
        >
          <Textarea
            label="Описание"
            autosize
            placeholder="Введите причину прерывания"
            key={form.key("interruptedMessageText")}
            {...form.getInputProps("interruptedMessageText")}
          />
          <Button type="submit" mt="sm">
            Подтвердить
          </Button>
        </form>
      </Modal>
      <Flex style={{ width: "50%" }} gap={"0.3em"} direction={"column"}>
        <TextInput
          rightSectionPointerEvents="none"
          label="Тип котла"
          readOnly
          value={componentsResponse.value.boilerTypeCycle.typeName}
        />
        <Flex gap={"1em"}>
          <TextInput
            style={{ width: "82%" }}
            rightSectionPointerEvents="none"
            readOnly
            label="Серийный номер котла"
            value={componentsResponse.value.boilerTypeCycle.article}
          />
          <Button
            style={{ width: "18%", marginTop: "1.7em" }}
            color="red"
            disabled={!isUserAuthorization.value || !isRunCycle.value}
            onClick={open}
            variant="filled"
          >
            Прервать
          </Button>
        </Flex>
      </Flex>
    </>
  );
}
