import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

const resolve = () => {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return darkQuery().matches ? "dark" : "light";
};

// The resolved theme ("light" | "dark"), following the OS until the viewer
// picks one. index.html applies the stored choice before first paint.
export function useTheme() {
  const [theme, setTheme] = useState(resolve);

  useEffect(() => {
    const query = darkQuery();
    const onChange = () => setTheme(resolve());
    query.addEventListener("change", onChange);
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      query.removeEventListener("change", onChange);
      observer.disconnect();
    };
  }, []);

  const toggle = useCallback(() => {
    const next = resolve() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this page view.
    }
  }, []);

  return { theme, toggle };
}
