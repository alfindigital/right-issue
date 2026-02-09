import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force re-render to ensure context providers are properly initialized
createRoot(document.getElementById("root")!).render(<App />);
