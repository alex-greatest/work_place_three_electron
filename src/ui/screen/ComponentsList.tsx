import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { MRT_Localization_RU } from "mantine-react-table/locales/ru/index.cjs"; // Removed due to module not found
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { ActionIcon, Box, Button, Flex, Tooltip } from "@mantine/core";
import { showError, showSuccess } from "../service/notification";
import { useSignal, useSignalEffect } from "@preact/signals-react";
import { context } from "../main";
import { IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";

//let timerId: NodeJS.Timeout | null = null;

const ComponentsList = () => {
  const contextApp = useContext<StoreApp>(context);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const isUserAuthorization = contextApp.stateApp.isUserAuthorization;
  const boilerOrderState = contextApp.stateApp.boilerOrder;
  const isPrinting = contextApp.stateApp.isPrinting;
  const isPrinterConnected = contextApp.stateApp.isPrinterConnected;
  const isUpdatedPrinterHistory = contextApp.stateApp.isUpdatedPrinterHistory;
  const data = useSignal<BoilerHistoryResponse[]>(
    [] as BoilerHistoryResponse[]
  );
  const page = useSignal<number>(0);
  const isLoading = useSignal<boolean>(false);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });

  function responsreeBoilerOrder(
    _event: Electron.IpcRendererEvent,
    boilerPage: BoilerPage | ErrorResponse
  ) {
    isLoading.value = false;
    timerId.current && clearTimeout(timerId.current);
    timerId.current = null;
    if ((boilerPage as ErrorResponse).message !== undefined) {
      showError(
        "response_amount_boiler_shift",
        (boilerPage as ErrorResponse).message
      );
      return;
    }
    const boielrPageResponse = boilerPage as BoilerPage;
    data.value = boielrPageResponse.content;
    page.value = boielrPageResponse.total;
  }

  function responsePrinHistory(
    _event: Electron.IpcRendererEvent,
    error: boolean,
    errorMessage: string
  ) {
    if (error) {
      showError("error_print_history", errorMessage);
      return;
    }
    showSuccess("success_print_history", "Этикетка распечатана");
  }

  function requestBoilerHistory() {
    window.exchangeServerAPI.requestBoilerHistory(pagination.pageIndex);
    isLoading.value = true;
    timerId.current = setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false;
        showError(
          "server_connection",
          "Нет ответа от сервера при получении истории"
        );
        timerId.current = null;
      }
    }, 10000);
  }

  useEffect(() => {
    const removeListenerResponseBoilerHistory =
      window.exchangeServerAPI.onResponseBoilerHistory(responsreeBoilerOrder);
    const removeListenerResponsePrintHistory =
      window.exchangePrinter.onResponsePrintHistory(responsePrinHistory);
    return () => {
      removeListenerResponseBoilerHistory();
      removeListenerResponsePrintHistory();
      timerId.current && clearTimeout(timerId.current);
    };
  }, []);

  useEffect(() => {
    if (
      boilerOrderState.value &&
      boilerOrderState.value.id &&
      boilerOrderState.value.id.trim().length === 10
    ) {
      requestBoilerHistory();
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useSignalEffect(() => {
    console.log(boilerOrderState.value.id);
    if (
      boilerOrderState.value &&
      boilerOrderState.value.id &&
      boilerOrderState.value.id.trim().length === 10
    ) {
      requestBoilerHistory();
    }
    if (
      boilerOrderState.value &&
      boilerOrderState.value.id &&
      boilerOrderState.value.id.trim().length === 0
    ) {
      data.value = [] as BoilerHistoryResponse[];
      page.value = 0;
    }
    if (isUpdatedPrinterHistory.value) {
      requestBoilerHistory();
      isUpdatedPrinterHistory.value = false;
    }
  });

  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<BoilerHistoryResponse>[]>(
    () => [
      {
        accessorKey: "serialNumber",
        header: "Серийный номер",
      },
      {
        accessorKey: "boilerTypeCycle.typeName",
        header: "Тип котла",
      },
      {
        accessorKey: "boilerTypeCycle.article", //normal accessorKey
        header: "Артикул",
      },
      {
        accessorKey: "dateCreate",
        header: "Дата/время печати",
        Cell: ({ row }) =>
          row.original?.dateCreate
            ? dayjs(row.original.dateCreate).format("DD.MM.YYYY HH:mm:ss")
            : "",
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: data.value ?? ([] as BoilerHistoryResponse[]),
    renderTopToolbarCustomActions: () => (
      <Tooltip label="Обновить данные">
        <ActionIcon
          onClick={() =>
            boilerOrderState.value &&
            boilerOrderState.value.id &&
            boilerOrderState.value.id.trim().length === 10 &&
            requestBoilerHistory()
          }
        >
          <IconRefresh />
        </ActionIcon>
      </Tooltip>
    ),
    renderBottomToolbarCustomActions: () => (
      <>
        <Flex>
          <b>Всего записей: {page.value}</b>
        </Flex>
      </>
    ),
    renderEmptyRowsFallback: () => (
      <Flex
        style={{
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "30px" }}>Данные не найдены</p>
      </Flex>
    ),
    paginationDisplayMode: "pages",
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableRowActions: true,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: true,
    enableSorting: false,
    enableDensityToggle: false,
    enableHiding: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableGlobalFilter: false,
    positionActionsColumn: "last",
    mantineTableContainerProps: { style: { width: '100%', maxHeight: "450px" } },
    mantinePaperProps: { style: { width: '100%' } },
    onPaginationChange: setPagination, //hoist pagination state to your state when it changes internally
    state: {
      pagination,
      isLoading: isLoading.value,
      showProgressBars: isLoading.value,
    }, //pass the pagination state to the table
    initialState: {
      pagination: { pageSize: 10, pageIndex: 1 },
      showColumnFilters: true,
      density: "xs",
    },
    rowCount: page.value ?? 0,
    mantinePaginationProps: {
      rowsPerPageOptions: ["10"],
      showRowsPerPage: false,
    },
    localization: MRT_Localization_RU,
    renderRowActions: ({ row }) => (
      <Box style={{ display: "flex", flexWrap: "nowrap", gap: "8px" }}>
        <Button
          onClick={() =>
            window.exchangePrinter.requestPrintHistory(row.original)
          }
          disabled={
            !isPrinterConnected.value ||
            isPrinting.value === true ||
            !isUserAuthorization.value
          }
          style={{ height: "23px" }}
        >
          Печать
        </Button>
      </Box>
    ),
  });

  return (
    <Flex style={{ width: "100%" }} mt={10} justify="center">
      <MantineReactTable table={table} />
    </Flex>
  );
};

export default ComponentsList;
