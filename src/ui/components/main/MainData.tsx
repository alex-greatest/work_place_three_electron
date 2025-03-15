import { Divider, Flex, Paper, } from "@mantine/core";
import ShiftNumber from "./ShiftNumber";
import OperatorCode from "./OperatorCode";
import BoilerData from "./BoilerData";
import ComponentsResult from "./ComponentsResult";

export default function MainData() {
  return (
    <Flex style={{width: '100%'}} direction={"column"} gap={"0.5em"}>
      <Paper
        radius="md"
        style={{
          width: "100%",
          display: "flex",
          padding: "10px",
        }}
      >
        <Flex style={{ width: "100%" }} gap={"1em"}>
          <ShiftNumber />
          <Divider orientation="vertical" />
          <BoilerData />
          <Divider orientation="vertical" />
          <OperatorCode />
        </Flex>
      </Paper>
      <ComponentsResult />
    </Flex>
  );
}
