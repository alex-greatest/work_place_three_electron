import { Flex, Loader } from "@mantine/core";

export default function Loading() {
    return (
        <Flex style={{height: '100%', width: '100%'}} justify="center" align="center">
            <Loader color="blue" />
        </Flex>
    );
}