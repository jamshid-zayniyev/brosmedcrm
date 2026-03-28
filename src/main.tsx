import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import AppProvider from "./router/provider";
import "./index.css";
import { Toaster } from "sonner";
import { queryClient } from "./lib/query-client";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AppProvider />
    <Toaster richColors />
  </QueryClientProvider>
);
