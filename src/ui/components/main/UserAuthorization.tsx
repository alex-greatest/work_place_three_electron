import { Button, Modal, PasswordInput, TextInput, Text, Flex } from "@mantine/core";
import { useContext, useEffect, useRef } from "react";
import { context } from "../../main";
import { useSignal } from "@preact/signals-react";
import { showError } from "../../service/notification";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";

//let timerId: NodeJS.Timeout | null = null;
//let timerAutoLogout: NodeJS.Timeout | null = null;

const UserAuthorization = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const timerAutoLogout = useRef<NodeJS.Timeout | null>(null);
  const contextApp = useContext<StoreApp>(context);
  const userAuthorization = contextApp.stateApp.userAuthorization;
  const isUserAuthorization = contextApp.stateApp.isUserAuthorization;
  const isLoadingUserAuthorization = useSignal<boolean>(false);
  const dateAutologout = useSignal<dayjs.Dayjs>(dayjs());

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      login: "",
      password: "",
    },

    validate: {
      login: (value: string) =>
        value.trim().length > 0 ? null : "Логин не может быть пустым",
      password: (value: string) =>
        value.trim().length > 0 ? null : "Пароль не может быть пустым",
    },
  });

  function requestUserAuthorization(values: {login: string, password: string}) {
    isLoadingUserAuthorization.value = true;
    const userAuthorization = {
      login: values.login,
      password: values.password,
      station: "wp2",
    };
    window.exchangeServerAPI.requestUserAuthorization(userAuthorization);
    timerId.current = setTimeout(() => {
      isLoadingUserAuthorization.value = false;
      showError("response_user_authorization_error", "Нет ответа от сервера");
    }, 20000);
  }

  function responseUserAuthorization(
    _event: Electron.IpcRendererEvent,
    userResponse: UserResponse | ErrorResponse
  ) {
    console.log(userResponse);
    isLoadingUserAuthorization.value = false;
    if ((userResponse as UserResponse).username !== undefined) {
      close();
      userAuthorization.value = userResponse as UserResponse;
      isUserAuthorization.value = true;
      timerId.current && clearTimeout(timerId.current);
      timerId.current = null;
      dateAutologout.value = dayjs().add(1, "minute");
      timerAutoLogout.current = setTimeout(autoLogout, 5000);
      return;
    }
    showError(
      "response_user_authorization",
      (userResponse as ErrorResponse).message
    );
  }

  function autoLogout() {
    if (isUserAuthorization.value && dayjs().isAfter(dateAutologout.value)) {
      isUserAuthorization.value = false;
      userAuthorization.value = { username: "", token: "" };
      timerAutoLogout.current && clearTimeout(timerAutoLogout.current);
      timerAutoLogout.current = null;
      return;
    }
    timerAutoLogout.current = setTimeout(autoLogout, 5000);
  }

  useEffect(() => {
    const removeListenerResponseUserAuthorization = window.exchangeServerAPI.onResponseUserAuthorization(responseUserAuthorization);
    return () => {
      removeListenerResponseUserAuthorization();
      timerId.current && clearTimeout(timerId.current);
      timerAutoLogout.current && clearTimeout(timerAutoLogout.current);
    };
  }, []);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size={"md"}
        withCloseButton={true}
        centered
      >
        <form onSubmit={form.onSubmit((values) => requestUserAuthorization(values))}>
          <TextInput
            label="Логин"
            placeholder="Логин"
            key={form.key("login")}
            {...form.getInputProps("login")}
          />
          <PasswordInput
            mt="sm"
            label="Пароль"
            placeholder="Пароль"
            key={form.key("password")}
            {...form.getInputProps("password")}
          />
          <Button type="submit" mt="sm">
            Подтвердить
          </Button>
        </form>
      </Modal>
      <Flex gap={"1em"} align={"center"} style={{ marginLeft: "auto", marginRight: "1em" }}>
        <Text hidden={!isUserAuthorization.value} style={{ fontSize: "23px" }}>
          {userAuthorization.value.username}
        </Text>
        <Button onClick={() => {
          if (isUserAuthorization.value) {
            isUserAuthorization.value = false;
            userAuthorization.value = { username: "", token: "" };
            timerAutoLogout.current && clearTimeout(timerAutoLogout.current);
            timerAutoLogout.current = null;
          } else {
            open();
          }
        }} variant="filled">
          {isUserAuthorization.value ? "Выйти" : "Авторизация"}
        </Button>
      </Flex>
    </>
  );
};

export default UserAuthorization;
