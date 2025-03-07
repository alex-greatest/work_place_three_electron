import { Textarea } from "@mantine/core";
import { context } from "../../main";
import { useContext } from "react";

export default function MessageHelper() {
  const textHelper = useContext<StoreApp>(context).stateApp.textHelper;

  return (
    <div>
      <Textarea
        fw={600}
        value={textHelper.value}
        readOnly
        styles={{ input: { fontSize: "35px" } }}
        rows={1}
      />
    </div>
  );
}
