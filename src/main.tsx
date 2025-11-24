import { createRoot } from "react-dom/client";
import AppProvider from "./router/provider";
import "./index.css";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <>
    <AppProvider />
    <Toaster richColors />
  </>
);
