import {
  Button,
  Card,
  Flex,
  Group,
  NumberInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useContext, useEffect, useRef } from "react";
import { context } from "../../main";
import { useSignal } from "@preact/signals-react/runtime";
import { showError } from "../../service/notification";
import { useForm } from "@mantine/form";

//let timerId: NodeJS.Timeout | null = null; 

export default function OperatorCode() {
  const contextApp = useContext<StoreApp>(context);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const serverStateConnection = contextApp.stateApp.isServerConnected;
  const user = contextApp.stateApp.user;
  const isGetCode = contextApp.stateApp.isGetCode;
  const isLoadingRequestUserCode = useSignal<boolean>(false);
  const isPrinting = contextApp.stateApp.isPrinting;
  const isGetBoilerOrder = contextApp.stateApp.isGetBoilerOrder;
  const isGetUniqueBoilerOrder = contextApp.stateApp.isGetUniqueBoilerOrder;

   function responseUserCode(_event: Electron.IpcRendererEvent, userResponse: UserResponse|ErrorResponse) {
      isLoadingRequestUserCode.value = false;
      if ((userResponse as UserResponse).username !== undefined) {
        user.value = userResponse as UserResponse;
        isGetCode.value = true;
        form.setFieldValue('code', user.value.code);
        timerId.current && clearTimeout(timerId.current);
        timerId.current = null;
        return;
      }
      showError("response_user_code", (userResponse as ErrorResponse).message);
    }
  
    useEffect(() => {
      const removeListenerServerState = window.exchangeServerAPI.onResponseOperatorCode(responseUserCode);
      return () => {
        removeListenerServerState();
        timerId.current && clearTimeout(timerId.current);
      }
    }, [])
  
    const form = useForm({
      mode: "controlled",
      initialValues: {
        code: 0,
      },
  
      validate: {
        code: (value) => (value >= 2 ? null : "Код должен быть больше двух"),
      },
    });

    function resetOperatorCode() {
      if (isPrinting.value) {
        return;
      }
      isGetCode.value = false;
      form.setFieldValue('code', 0);
      user.value = {username: "", code: 0, roleDto: {name: ""}};
      window.syncState.requestOperatorCodeReset();
    }

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      style={{ width: "550px", height: "268px" }}
    >
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={700} fz={18}>
            Данные оператора
          </Text>
        </Group>
      </Card.Section>
      <Flex
        gap={"0.5em"}
        direction={"column"}
        style={{
          width: "100%",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <Flex style={{ marginTop: "1em", width: "99%" }}></Flex>
        <form
          style={{ display: "flex", gap: "0.7em" }}
          onSubmit={form.onSubmit((values) => {
            if (!serverStateConnection.value) {
              showError("server_connection", "Нет связи с сервером");
              return;
            }
            isLoadingRequestUserCode.value = true;
            window.exchangeServerAPI.requestOperatorCode(values.code);
            timerId.current = setTimeout(() => {
                if (isLoadingRequestUserCode.value) {
                    isLoadingRequestUserCode.value = false;
                    showError("server_connection", "Нет ответа от сервера");
                    timerId.current = null;
                }
            }, 15000);
          })}
        >
          <NumberInput
            style={{ width: "50%" }}
            label="Код оператора"
            required
            min={2}
            key={form.key("code")}
            {...form.getInputProps("code")}
            readOnly={isGetCode.value}
            placeholder="Введите код"
          />
          <Button
            style={{ width: "25%", marginTop: "1.7em" }}
            variant="filled"
            disabled={isGetCode.value}
            type="submit"
            loading={isLoadingRequestUserCode.value}
          >
            Ввод
          </Button>
          <Button
            style={{ width: "30%", marginTop: "1.7em" }}
            disabled={!isGetCode.value || isPrinting.value || isGetBoilerOrder.value || isGetUniqueBoilerOrder.value}
            onClick={resetOperatorCode}
            color="red"
            variant="filled"
          >
            Сброс номера
          </Button>
        </form>
        <TextInput
          style={{ width: "100%" }}
          value={user.value?.username}
          rightSectionPointerEvents="none"
          label="Имя оператора"
          readOnly={true}
        />
      </Flex>
    </Card>
  );
}
