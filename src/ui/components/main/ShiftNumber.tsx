import { Flex, NumberInput, Paper, TextInput } from "@mantine/core";
import { showError } from "../../service/notification";
import { useContext, useEffect } from "react";
import { context } from "../../main";

export default function ShiftNumber() {
  const contextApp = useContext<StoreApp>(context);
  const shift = contextApp.stateApp.shift;
  const amountBoilerShift = contextApp.stateApp.amountBoilerShift;

  function responseShift(_event: Electron.IpcRendererEvent, shiftResponse: number | ErrorResponse) {
    if ((shiftResponse as ErrorResponse).message !== undefined) {
      showError("response_shift", (shiftResponse as ErrorResponse).message);
      return;
    }
    shift.value = shiftResponse as number;
  }

  function responseAmountBoilerShift(_event: Electron.IpcRendererEvent, amountBoilerShiftResponse: number | ErrorResponse) {
    if ((amountBoilerShiftResponse as ErrorResponse).message !== undefined) {
      showError("response_amount_boiler_shift", (amountBoilerShiftResponse as ErrorResponse).message);
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
    <Paper
      radius="md"
      style={{
        width: "550px",
        height: "80px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Flex style={{ width: "100%" }} gap={"1em"}>
      <NumberInput
          style={{ width: "50%" }}
          mb={"0.5em"}
          rightSectionPointerEvents="none"
          label="Номер смены"
          readOnly
          value={shift.value}
        />
        <TextInput
          style={{ width: "50%" }}
          mb={"0.5em"}
          rightSectionPointerEvents="none"
          label="Распечатано этикеток за смену"
          value={amountBoilerShift.value}
          readOnly={true}
        />
      </Flex>
    </Paper>
  );
}
