import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { MRT_Localization_RU } from "mantine-react-table/locales/ru/index.cjs"; // Removed due to module not found
import { useContext, useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { Flex } from "@mantine/core";
import { context } from "../main";

//let timerId: NodeJS.Timeout | null = null;

const ComponentsList = () => {
  const contextApp = useContext<StoreApp>(context);
  const components: ComponentSetDto[] = contextApp.stateApp.componentsResponse.value.componentSetDtoList;

  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<ComponentSetDto>[]>(
    () => [
      {
        accessorKey: "componentType.name",
        header: "Название компонента",
      },
      {
        accessorKey: "value",
        header: "Значение",
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: components,
    renderEmptyRowsFallback: () => (
      <Flex style={{  
        width: '100%',
        justifyContent: 'center',
        backgroundColor: 'white',
        alignItems: 'center' }}> 
        <p style={{fontSize: "30px"}}>Данные не найдены</p>
      </Flex>
    ),
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    mantineTableContainerProps: { style: { maxHeight: '450px' } },
    initialState: { density: 'xs' },
    mantineTableProps: {
      highlightOnHover: false,
      striped: 'odd',
      withColumnBorders: true,
      withRowBorders: true,
      withTableBorder: true,
    },
    mantinePaginationProps: {
      rowsPerPageOptions: ["10"],
      showRowsPerPage: false,
    },
    localization: MRT_Localization_RU
  });

  return (
    <Flex style={{ width: "100%", height: "80%" }} mt={25} justify="center">
      <div style={{ width: "90%" }}>
        <MantineReactTable table={table} />
      </div>
    </Flex>
  );
};

export default ComponentsList;
