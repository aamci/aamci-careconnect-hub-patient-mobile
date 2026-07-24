import { useEffect, useState } from "react";

const STORAGE_KEY = "medisante:dark-mode";

export function useDarkMode() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  return { enabled, toggle: () => setEnabled((v) => !v), setEnabled };
}
