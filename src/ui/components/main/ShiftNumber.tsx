import { Flex, NumberInput, Paper, TextInput } from "@mantine/core";
import { showError } from "../../service/notification";
import { useContext, useEffect } from "react";
import { context } from "../../main";

export default function ShiftNumber() {
  const contextApp = useContext<StoreApp>(context);
  const shift = contextApp.stateApp.shift;
  const amountBoilerShift = contextApp.stateApp.amountBoilerShift;

  function responseShift(
    _event: Electron.IpcRendererEvent,
    shiftResponse: number | ErrorResponse
  ) {
    if ((shiftResponse as ErrorResponse).message !== undefined) {
      showError("response_shift", (shiftResponse as ErrorResponse).message);
      return;
    }
    shift.value = shiftResponse as number;
  }

  function responseAmountBoilerShift(
    _event: Electron.IpcRendererEvent,
    amountBoilerShiftResponse: number | ErrorResponse
  ) {
    if ((amountBoilerShiftResponse as ErrorResponse).message !== undefined) {
      showError(
        "response_amount_boiler_shift",
        (amountBoilerShiftResponse as ErrorResponse).message
      );
      return;
    }
    amountBoilerShift.value = amountBoilerShiftResponse as number;
  }

  useEffect(() => {
    const removeListenerShift =
      window.exchangeServerAPI.onResponseShift(responseShift);
    const removeListenerAmountBoilerShift =
      window.exchangeServerAPI.onResponseAmountBoiler(
        responseAmountBoilerShift
      );
    return () => {
      removeListenerShift();
      removeListenerAmountBoilerShift();
    };
  }, []);

  return (
    <Flex style={{ width: "10%", marginLeft: '0.7em'}} justify={"center"} gap={"0.3em"} direction={"column"}>
      <NumberInput
        rightSectionPointerEvents="none"
        label="Номер смены"
        readOnly
        value={shift.value}
      />
      <TextInput
        rightSectionPointerEvents="none"
        label="Котлов за смену"
        value={amountBoilerShift.value}
        readOnly={true}
      />
    </Flex>
  );
}
