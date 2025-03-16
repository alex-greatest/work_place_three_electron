import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-react-table/styles.css";
import { MRT_Localization_RU } from "mantine-react-table/locales/ru/index.cjs"; // Removed due to module not found
import { useContext, useEffect, useMemo, useRef } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { Box, Button, Flex } from "@mantine/core";
import { context } from "../../main";
import { useSignalEffect } from "@preact/signals-react";
import { showError } from "../../service/notification";

//let timerId: NodeJS.Timeout | null = null;

const ComponentsResult = () => {
  const contextApp = useContext<StoreApp>(context);
  const componentsResult = contextApp.stateApp.componenstResult;
  const componenstResultRequest = contextApp.stateApp.componenstResultRequest;
  const actualNumberBindingComponent = contextApp.stateApp.actualNumberBindingComponent;
  const amountBindingComponent = contextApp.stateApp.amountBindingComponent;
  const actualScannedComponent = contextApp.stateApp.actualScannedComponent;
  const actualResultComponent = contextApp.stateApp.actualResultComponent;
  const componentsResponse = contextApp.stateApp.componentsResponse;
  const isExchangeServer = contextApp.stateApp.isExchangeServer;
  const isRunCycle = contextApp.stateApp.isRunCycle;
  const isInizializeRunCycle = contextApp.stateApp.isInizializeRunCycle;
  const isWaitNewCycleStart = contextApp.stateApp.isWaitNewCycleStart;
  const isNotResposenSaveResult = contextApp.stateApp.isNotResposenSaveResult;
  const isErorrSaveResults = contextApp.stateApp.isErorrSaveResults;
  const timerWaitResultComponents = useRef<NodeJS.Timeout | null>(null);

  function createComponentsResult() {
    if (componentsResponse.value.componentBindingResponses.length > 0 && componentsResult.value.length === 0) {
      componenstResultRequest.value = [] as ComponentsResult[];
      const newComponentsResult = componentsResponse.value.componentBindingResponses.map((componentBinding: ComponentBindingResponse) => ({
        componentType: componentBinding.componentType,
        scannedValue: "",
        status: "",
      }));
      componentsResult.value = [...newComponentsResult];
    }
  }

  function responseComponentsScanned(_event: Electron.IpcRendererEvent, value: string) {
    const componentsTypeName: string = actualScannedComponent.value.componentType.name;
    const components: ComponentSetDto[] = componentsResponse.value.componentSetDtoList;
    const componentValueFound = components.find((component: ComponentSetDto) => 
      component.componentType.name === componentsTypeName && component.value === value);
    actualResultComponent.value.scannedValue = value;
    actualResultComponent.value.status = componentValueFound ? "OK" : "NOK";
    componentsResult.value = [...componentsResult.value];
    componenstResultRequest.value.push({
      componentType: actualScannedComponent.value.componentType,
      scannedValue: value,
      status: actualResultComponent.value.status,
    });
    checkStatus();
  }

  function checkStatus() {
    switch (actualResultComponent.value.status) {
      case "OK":
        contextApp.stateApp.stateResult.value = "OK";
        continueScanned();
        break;
      case "NOK":
        contextApp.stateApp.stateResult.value = "NOK";
        requestServerComponentsResultSave();
        break;
      default:
        break;
    }
  }

  function continueScanned() {
    actualNumberBindingComponent.value += 1;
    if (actualNumberBindingComponent.value < amountBindingComponent.value) {
      actualScannedComponent.value = componentsResponse.value.componentBindingResponses[actualNumberBindingComponent.value];
      actualResultComponent.value = componentsResult.value[actualNumberBindingComponent.value];
    } else {
      requestServerComponentsResultSave();
    }
  }

  function resetState() {
    window.syncState.requestMainStateReset();
    isRunCycle.value = false;
    isInizializeRunCycle.value = false;
    isWaitNewCycleStart.value = true;
    window.exchangeScanner.requestScannedNewSerialNumber(true);
  }

  function requestServerComponentsResultSave() {
    window.exchangeScanner.requestScannedComponentsAllowed(false);
    isExchangeServer.value = true;
    const componentsResultRequestSend: ComponentsResultRequest = {
      componentsResult: componenstResultRequest.value, 
      serialNumber: componentsResponse.value.boilerTypeCycle.serialNumber,
      stationName: "",
      status: contextApp.stateApp.stateResult.value
    };
    window.exchangeServerAPI.requestSaveResultComponents(componentsResultRequestSend);
    timerWaitResultComponents.current = setTimeout(() => {
      if (isExchangeServer.value) {
        isExchangeServer.value = false;
        isNotResposenSaveResult.value = true;
        showError("response_operation_save_results", "Не удалось получить ответ от сервера");
      }
    }, 10000);
  }

  function responseServerComponentsResultSave(_event: Electron.IpcRendererEvent, value: WpResponse | ErrorResponse) {
    isNotResposenSaveResult.value = false;
    isExchangeServer.value = false;
    timerWaitResultComponents.current && clearTimeout(timerWaitResultComponents.current);
    timerWaitResultComponents.current = null;
    if ((value as WpResponse).amountBoilerShiftMade !== undefined) {
      resetState();
      return;
    }
    if ((value as ErrorResponse).message !== undefined) {
      isErorrSaveResults.value = true;
      showError("response_operation_save_results", (value as ErrorResponse).message);
      return;
    }
  }

  useSignalEffect(() => {
    if (isRunCycle.value && !isInizializeRunCycle.value) {
      createComponentsResult();
      isInizializeRunCycle.value = true;
      const componentBinding: ComponentBindingResponse[] = componentsResponse.value.componentBindingResponses;
      actualNumberBindingComponent.value = 0;
      actualScannedComponent.value = componentBinding[actualNumberBindingComponent.value];
      actualResultComponent.value = componentsResult.value[actualNumberBindingComponent.value];
      amountBindingComponent.value = componentBinding.length;
      window.exchangeScanner.requestScannedComponentsAllowed(true);
    }
  })

  useEffect(() => {
    const removeListenerComponentsScanned = window.exchangeScanner.onResponseScanСomponents(responseComponentsScanned);
    const removeListenerServerComponentsResultSave = window.exchangeServerAPI.onResponseSaveResultComponents(responseServerComponentsResultSave);
    return () => {
      removeListenerComponentsScanned();
      removeListenerServerComponentsResultSave();
      timerWaitResultComponents.current && clearTimeout(timerWaitResultComponents.current);
    };
  }, [])


  const columns = useMemo<MRT_ColumnDef<ComponentsResult>[]>(
    () => [
      {
        accessorKey: "componentType.name",
        header: "Название компонента",
      },
      {
        accessorKey: "scannedValue",
        header: "Отсканированное значение",
      },
      {
        accessorKey: "status",
        header: "Статус",
        Cell: ({ cell }) => {
          if (cell.getValue<string>() === "") {
            return <div> {cell.getValue<string>()} </div>;
          }
          return <Box style={(theme) => ({
            backgroundColor: cell.getValue<string>() === "OK" ? theme.colors.green[9] : 
            cell.getValue<string>() === "NOK" ? theme.colors.red[9] : theme.colors.gray[9],
            borderRadius: '4px',
            color: '#fff',
            maxWidth: '9ch',
            padding: '4px',
            display: 'flex',
            justifyContent: 'center',
          })}>{cell.getValue<string>()}</Box>;
        }
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: componentsResult.value,
    renderEmptyRowsFallback: () => (
      <Flex style={{  
        width: '100%', 
        justifyContent: 'center',
        backgroundColor: 'white',
        alignItems: 'center' }}> 
        <p style={{fontSize: "30px"}}></p>
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
    <Flex style={{ width: "100%", height: "80%" }} mt={1} justify="center">
      <Button style={{position: 'absolute', 
                    display: !isNotResposenSaveResult.value && !isErorrSaveResults.value ? 'none' : 'block', 
                    backgroundColor: 'red',
                    height: '90px',
                    width: '200px',
                    left: '40em', 
                    top: '30em', 
                    zIndex: '5000'}} onClick={requestServerComponentsResultSave}>
        Повторить запрос
      </Button>
      <div style={{ width: "100%" }}>
        <MantineReactTable table={table} />
      </div>
    </Flex>
  );
};

export default ComponentsResult;
