import { createContext, useContext, useEffect, useState } from "react";
import { defaultDoc, loadExampleDoc } from "./results";

const ResultsContext = createContext(defaultDoc);

const EXAMPLE_KEY = "archbench:example-data";

const wantsExample = () => {
  if (!import.meta.env.DEV) return false;
  const param = new URLSearchParams(window.location.search).get("data");
  try {
    if (param === "example") sessionStorage.setItem(EXAMPLE_KEY, "1");
    if (param === "real") sessionStorage.removeItem(EXAMPLE_KEY);
    return sessionStorage.getItem(EXAMPLE_KEY) === "1";
  } catch {
    return param === "example";
  }
};

export function ResultsProvider({ children }) {
  const [doc, setDoc] = useState(defaultDoc);

  useEffect(() => {
    if (!wantsExample()) return;
    let cancelled = false;
    loadExampleDoc().then((example) => {
      if (example && !cancelled) setDoc(example);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ResultsContext.Provider value={doc}>{children}</ResultsContext.Provider>;
}

export const useResults = () => useContext(ResultsContext);
