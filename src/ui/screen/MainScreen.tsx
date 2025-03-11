import { Flex } from "@mantine/core";
import MainData from "../components/main/MainData";
import ComponentScanned from "../components/main/ComponentScanned";

export default function MainScreen() {
  return (
    <Flex
      direction="column"
      style={{
        width: "100%",
        height: "100%",
        padding: "5px 20px 20px 20px",
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
        <Flex style={{ width: "100%" }} direction="column">
          <MainData />
          <ComponentScanned />
        </Flex>
      </Flex>
    </Flex>
  );
}
