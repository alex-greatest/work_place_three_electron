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
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Modal,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { showError, showSuccess } from "../service/notification";
import { useSignal } from "@preact/signals-react";
import { context } from "../main";
import { IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";

//let timerId: NodeJS.Timeout | null = null;

const HistorySearching = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const contextApp = useContext<StoreApp>(context);
  const idBoilerOrder = useSignal<string>("");
  const isPrinting = contextApp.stateApp.isPrinting;
  const isPrinterConnected = contextApp.stateApp.isPrinterConnected;
  const data = useSignal<BoilerHistoryResponse[]>(
    [] as BoilerHistoryResponse[]
  );
  const page = useSignal<number>(0);
  const isLoading = useSignal<boolean>(false);
  const error = useSignal<string | null>(null);
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

  function requestBoilerHistoryManual() {
    data.value = [] as BoilerHistoryResponse[];
    page.value = 0;
    if (!idBoilerOrder.value || idBoilerOrder.value.trim().length === 0) {
      error.value = "Поле необходимо заполнить";
      return;
    }
    if (isPrinterConnected.value === false) {
      showError("printer_connection", "Нет связи с принтером");
      return;
    }
    window.exchangeServerAPI.requestBoilerHistoryManual(
      idBoilerOrder.value,
      pagination.pageIndex
    );
    isLoading.value = true;
    timerId.current = setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false;
        showError("server_connection", "Нет ответа от сервера");
        timerId.current = null;
      }
    }, 10000);
  }

  function requestScan() {
    open();
  }

  function onResponseScanManual(_event: Electron.IpcRendererEvent, id: string) {
    idBoilerOrder.value = id;
    showSuccess("success_scan_manual", `Отсканирован код №${id}`);
    close();
  }

  function onResponseScanManualError(
    _event: Electron.IpcRendererEvent,
    error: string
  ) {
    showError("scan_manual_error", error);
  }

  useEffect(() => {
    const removeListenerResponseBoilerHistoryManual =
      window.exchangeServerAPI.onResponseBoilerHistoryManual(
        responsreeBoilerOrder
      );
    const removeListenerResponsePrintHistory =
      window.exchangePrinter.onResponsePrintHistory(responsePrinHistory);
    const removeListenerResponseScanManual =
      window.exchangeScanner.onResponseScanManual(onResponseScanManual);
    const removeListenerResponseScanManualError =
      window.exchangeScanner.onResponseScanManualError(
        onResponseScanManualError
      );
    return () => {
      removeListenerResponseBoilerHistoryManual();
      removeListenerResponsePrintHistory();
      removeListenerResponseScanManual();
      removeListenerResponseScanManualError();
      timerId.current && clearTimeout(timerId.current);
    };
  }, []);

  useEffect(() => {
    if (idBoilerOrder.value && idBoilerOrder.value.trim().length === 10) {
      requestBoilerHistoryManual();
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    window.exchangeScanner.requestScanManual(opened);
  }, [opened]);

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
            ? dayjs(row.original.dateCreate).format("HH:mm:ss DD.MM.YYYY")
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
            idBoilerOrder.value &&
            idBoilerOrder.value.trim().length === 10 &&
            requestBoilerHistoryManual()
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
    mantineTableContainerProps: { style: { maxHeight: "550px" } },
    onPaginationChange: setPagination,
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
          disabled={!isPrinterConnected.value || isPrinting.value === true}
          style={{ height: "23px" }}
        >
          Печать
        </Button>
      </Box>
    ),
    renderEmptyRowsFallback: () => (
      <Flex
        style={{
          height: "200px",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "30px" }}>Данные не найдены</p>
      </Flex>
    ),
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size={"md"}
        withCloseButton={false}
        centered
        closeOnClickOutside={false}
      >
        <Flex mt={"3em"} direction={"column"} gap={30}>
          <Text
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              fontSize: "25px",
            }}
          >
            Отсканируйте уникальный номер канбан-карты
          </Text>
          <Button style={{ marginLeft: "auto" }} onClick={close}>
            Отмена
          </Button>
        </Flex>
      </Modal>
      <Flex style={{ width: "100%", height: "80%" }} mt={10}>
        <Flex
          style={{ width: "100%" }}
          gap={10}
          direction={"column"}
          align={"center"}
        >
          <Flex style={{ width: "80%" }} gap={10} justify={"end"}>
            <TextInput
              label="Уникальный номер"
              placeholder="Уникальный номер"
              error={error.value}
              value={idBoilerOrder.value}
              onChange={(value) => (idBoilerOrder.value = value.target.value)}
              onFocus={() => (error.value = null)}
            />
            <Button onClick={requestBoilerHistoryManual} mt={25}>
              Подтвердить
            </Button>
            <Button onClick={requestScan} mt={25}>
              Сканировать
            </Button>
          </Flex>
          <div style={{ width: "80%" }}>
            <MantineReactTable table={table} />
          </div>
        </Flex>
      </Flex>
    </>
  );
};

export default HistorySearching;
