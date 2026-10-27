import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button, Dialog } from "./ui";

// Loads a task's worked example (public/*.md) and shows it in a dialog.
export default function ExampleDialog({ file, title, open, onClose }) {
  const [text, setText] = useState("");
  const [state, setState] = useState("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !file || state === "ready") return;
    let cancelled = false;
    setState("loading");
    fetch(`/${file}`)
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error(response.statusText))))
      .then((body) => {
        if (cancelled) return;
        setText(body);
        setState("ready");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [open, file, state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        state === "ready" && (
          <Button onClick={copy} className="min-h-[36px] px-3 text-[13px]">
            {copied ? "Copied" : "Copy markdown"}
          </Button>
        )
      }
    >
      {state === "loading" && <p className="text-sm text-ink-2">Loading the example…</p>}
      {state === "error" && (
        <p className="text-sm text-ink-2">
          The example could not be loaded. <a href={`/${file}`} className="link">Open the file directly</a>.
        </p>
      )}
      {state === "ready" && (
        <div className="prose prose-sm prose-tokens max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      )}
    </Dialog>
  );
}
