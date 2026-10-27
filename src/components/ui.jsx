import { useEffect, useRef } from "react";
import { DIRECTION_ARROW, DIRECTION_LABEL } from "../lib/metrics";
import { familyColor } from "../lib/colors";

export function Page({ children, className = "" }) {
  return <main className={`mx-auto w-full max-w-content px-4 sm:px-6 pb-24 ${className}`}>{children}</main>;
}

export function PageHeader({ title, lead, children, eyebrow }) {
  return (
    <header className="flex max-w-3xl flex-col gap-4 pt-10 sm:pt-14">
      {eyebrow}
      <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.022em] sm:text-[40px] sm:leading-[1.1]">{title}</h1>
      {lead && <p className="text-[17px] leading-relaxed text-ink-2">{lead}</p>}
      {children}
    </header>
  );
}

export function SectionHeader({ title, lead, children, as: Heading = "h2" }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-2xl flex-col gap-1.5">
        <Heading className="text-[22px] font-semibold tracking-[-0.015em]">{title}</Heading>
        {lead && <p className="text-sm leading-relaxed text-ink-2">{lead}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

// A row of mutually exclusive buttons (a segmented control).
export function Segmented({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded-[9px] bg-control p-[3px] text-[13px]">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`whitespace-nowrap rounded-[7px] px-3 py-1.5 transition-colors duration-150 ease-out-quart ${
              active ? "bg-control-active font-medium text-ink shadow-control" : "text-ink-2 hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// Choice chips that wrap, for longer option lists such as metrics.
export function Chips({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`num rounded-lg border px-3 py-1.5 text-[13px] transition-colors duration-150 ease-out-quart ${
              active ? "border-ink bg-ink text-page" : "border-line-strong text-ink-2 hover:border-ink-3 hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SourceBadge({ source }) {
  if (source === "inhouse") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-accent-tint px-2.5 py-0.5 text-xs font-medium text-accent-on-tint">
        In-house
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-line-strong px-2.5 py-px text-xs font-medium text-ink-2">
      Paper
    </span>
  );
}

export function Tag({ children }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-line-strong px-2.5 py-px text-xs font-medium text-ink-2">
      {children}
    </span>
  );
}

export function FamilyDot({ family, size = 8 }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: familyColor(family) }}
    />
  );
}

export function Direction({ direction, withLabel = true, className = "" }) {
  if (direction === "none") {
    return <span className={`text-ink-2 ${className}`}>{DIRECTION_LABEL.none}</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === "higher" ? <path d="M12 19V5M6 11l6-6 6 6" /> : <path d="M12 5v14M6 13l6 6 6-6" />}
      </svg>
      {withLabel ? DIRECTION_LABEL[direction] : <span className="sr-only">{DIRECTION_LABEL[direction]}</span>}
    </span>
  );
}

// Inline arrow after a metric name, announced as words.
export function DirectionArrow({ direction }) {
  if (!DIRECTION_ARROW[direction]) return null;
  return (
    <span>
      <span aria-hidden="true"> {DIRECTION_ARROW[direction]}</span>
      <span className="sr-only">, {DIRECTION_LABEL[direction].toLowerCase()}</span>
    </span>
  );
}

export function ExternalIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function ChevronRight({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// Native <dialog> with a header and close button; closes on backdrop click.
export function Dialog({ open, onClose, title, actions, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className="m-auto w-[calc(100%-32px)] max-w-4xl rounded-2xl border border-line bg-page p-0 text-ink shadow-pop backdrop:bg-black/40"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id="dialog-title" className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 hover:bg-control hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </dialog>
  );
}

export function Button({ as: Component = "button", variant = "secondary", className = "", ...props }) {
  const styles =
    variant === "primary"
      ? "bg-accent text-page hover:bg-accent-strong"
      : "border border-line-strong text-ink hover:border-ink-3 hover:bg-control";
  return (
    <Component
      className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-150 ease-out-quart ${styles} ${className}`}
      {...(Component === "button" ? { type: "button" } : {})}
      {...props}
    />
  );
}
