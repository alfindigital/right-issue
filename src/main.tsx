import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

// LanguageProvider is mounted at the root entry so every subtree — including
// lazy routes and error boundaries that remount — always has the context.
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </HelmetProvider>
);
