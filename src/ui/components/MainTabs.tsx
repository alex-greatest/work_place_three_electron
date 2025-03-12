import classes from "../css/main.module.css";
import { Tabs } from "@mantine/core";
import MainScreen from "../screen/MainScreen";
import { lazy, Suspense, useContext } from "react";
import Loading from "./Loading.tsx";
import { context } from "../main.tsx";

//const ComponentsList = lazy(() => import('../screen/ComponentsList.tsx'));
//const HistorySearchingLazy = lazy(() => import('../screen/HistorySearching.tsx'));

export default function MainTabs() {
  const contextApp = useContext<StoreApp>(context);
  const isUserAuthorization = contextApp.stateApp.isUserAuthorization;

  return (
    <Tabs
      color="indigo"
      defaultValue="Main"
      variant="outline"
      style={{ width: "100%", height: "100%" }}
      classNames={{ root: classes.root, panel: classes.panel_tabs }}
    >
      <Tabs.List>
        <Tabs.Tab value="Main"> Главный экран </Tabs.Tab>
        <Tabs.Tab value="components_list"> Компоненты </Tabs.Tab>
        <Tabs.Tab disabled={!isUserAuthorization.value} value="history_search"> История (поиск) </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="Main">
        <MainScreen />
      </Tabs.Panel>
      <Tabs.Panel value="components_list" keepMounted={false}>
        <Suspense fallback={<Loading />}>
        </Suspense>
      </Tabs.Panel>
      <Tabs.Panel keepMounted={false} value="history_search">
        <Suspense fallback={<Loading />}>
        </Suspense>
      </Tabs.Panel>
    </Tabs>
  );
}
