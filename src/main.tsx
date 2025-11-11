
  import { createRoot } from "react-dom/client";
  import AppProvider from "./router/provider";
  import "./index.css";
  
  createRoot(document.getElementById("root")!).render(<AppProvider />);  