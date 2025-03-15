import { createContext, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { createAppStore } from "./service/store.ts";
import "@mantine/notifications/styles.css";
import "./css/index.css";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from '@mantine/modals';
import Loading from "./components/Loading.tsx";

const appStore = createAppStore();
export const context = createContext<StoreApp>(appStore);

const container = document.getElementById("root")!;

// 2. Создаем корень только один раз
const root = createRoot(container);

root.render(
  <StrictMode>
    <context.Provider value={appStore}>
      <MantineProvider>
        <ModalsProvider>
          <Notifications />
          <App />
        </ModalsProvider>
      </MantineProvider>
    </context.Provider>
  </StrictMode>
);
