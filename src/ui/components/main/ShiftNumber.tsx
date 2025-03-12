import { Flex, NumberInput, TextInput } from "@mantine/core";
import { useContext } from "react";
import { context } from "../../main";

export default function ShiftNumber() {
  const contextApp = useContext<StoreApp>(context);
  const shift = contextApp.stateApp.shift;
  const amountBoilerShift = contextApp.stateApp.amountBoilerShift;

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
