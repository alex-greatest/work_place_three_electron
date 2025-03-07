import { Flex } from "@mantine/core";
import ShiftNumber from "../components/main/ShiftNumber";
import OperatorCode from "../components/main/OperatorCode";
import Canban from "../components/main/BoilerOrder";
import PrintBarcode from "../components/main/PrintBarcode";

export default function MainScreen() {

  return (
    <Flex
      direction="column"
      style={{
        width: "100%",
        height: "100%",
        padding: "15px 20px 20px 20px",
      }}
    >
      <Flex
        gap="1em"
        style={{
          width: "100%",
          padding: "5px 20px 10px 20px",
          justifyContent: "center",
        }}
      >
        <Flex gap="0.2em" direction="column">
          <ShiftNumber />
          <OperatorCode />
        </Flex>
      </Flex>
    </Flex>
  );
}
