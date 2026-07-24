import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply stored dark mode preference before render to avoid flash
try {
  const stored = localStorage.getItem("medisante:dark-mode");
  const prefersDark =
    stored === null
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : stored === "true";
  if (prefersDark) document.documentElement.classList.add("dark");
} catch {
  // ignore
}

createRoot(document.getElementById("root")!).render(<App />);
