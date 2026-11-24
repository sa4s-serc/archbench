import { useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import { familyColor } from "../lib/colors";
import { logoFor } from "../lib/logos";
import { DIRECTION_ARROW, DIRECTION_LABEL } from "../lib/metrics";

// Sticky page title bar, as on the live site.
export function TopBar({ title, subtitle, children }) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300/50 bg-base-100">
      <div className="flex min-h-[4rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold leading-tight sm:text-lg">{title}</h1>
          {subtitle && <p className="hidden truncate text-xs text-base-content/50 sm:block">{subtitle}</p>}
        </div>
        {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}

export const Page = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-[1240px] p-4 pb-16 sm:p-6 lg:p-8 ${className}`}>{children}</div>
);

// Summary card with an icon tile, as on the live leaderboard.
export function SummaryCard({ icon: Icon, title, children, aside }) {
  return (
    <div className="card-flat flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        {Icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon size={22} aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-bold">{title}</h2>
          <div className="mt-1 text-sm leading-relaxed text-base-content/70">{children}</div>
        </div>
      </div>
      {aside}
    </div>
  );
}

export function SectionTitle({ id, icon: Icon, title, lead, sheet, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {sheet && (
          <p className="bp-label mb-1.5 flex items-center gap-2" aria-hidden="true">
            <span>{sheet}</span>
            <span className="h-px w-8 bg-current opacity-50" />
          </p>
        )}
        <h2 id={id} className="flex items-center gap-2 text-xl font-bold">
          {Icon && <Icon size={19} className="text-primary" aria-hidden="true" />}
          {title}
        </h2>
        {lead && <p className="mt-1 max-w-[72ch] text-sm text-base-content/60">{lead}</p>}
      </div>
      {children}
    </div>
  );
}

// Filter pills, as on the live leaderboard's scenario toggles.
export function Pills({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={`rounded-xl border px-4 py-1.5 text-xs font-medium transition-colors ${
              active ? "border-primary/20 bg-primary/10 text-primary" : "border-base-300/50 text-base-content/60 hover:bg-base-200/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const FamilyDot = ({ family, size = 8 }) => (
  <span aria-hidden="true" className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: familyColor(family) }} />
);

export function DirectionArrow({ direction }) {
  if (!DIRECTION_ARROW[direction]) return null;
  return (
    <span>
      <span aria-hidden="true"> {DIRECTION_ARROW[direction]}</span>
      <span className="sr-only">, {DIRECTION_LABEL[direction].toLowerCase()}</span>
    </span>
  );
}

export const ExternalIcon = ({ size = 13 }) => <ArrowUpRight size={size} aria-hidden="true" />;

// Provider logo, or a lettered tile when no mark is available.
export function ModelLogo({ model, size = 16 }) {
  const logo = logoFor(model);
  if (logo.src) {
    return <img src={logo.src} alt="" title={logo.org} width={size} height={size} className={`shrink-0 ${logo.mono ? "logo-mono" : ""}`} style={{ width: size, height: size }} />;
  }
  return (
    <span
      title={logo.org}
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-[3px] bg-base-content font-semibold text-base-100"
      style={{ width: size, height: size, fontSize: Math.max(7, size * (logo.initials.length > 2 ? 0.36 : 0.46)) }}
    >
      {logo.initials}
    </span>
  );
}

export function Dialog({ open, onClose, title, actions, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="dialog-title"
      className="m-auto w-[calc(100%-32px)] max-w-4xl rounded-2xl border border-base-300 bg-base-100 p-0 text-base-content shadow-xl backdrop:bg-black/40"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-base-300 px-5 py-4">
          <h2 id="dialog-title" className="text-lg font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            {actions}
            <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-sm btn-circle">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </dialog>
  );
}

export const Container = ({ className = "", children }) => (
  <div className={`mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

// Page heading: the live site's top bar, then a bold title block.
// eslint-disable-next-line no-unused-vars
export function PageBand({ back, title, barTitle, lead, aside, children }) {
  return (
    <>
      <Container className="pt-8 sm:pt-10">
        {back && (
          <Link to={back.to} className="text-xs text-base-content/50 hover:text-primary">
            &larr; {back.label}
          </Link>
        )}
        <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            {lead && <p className="mt-2 text-base leading-relaxed text-base-content/70">{lead}</p>}
          </div>
          {aside}
        </div>
        {children}
      </Container>
    </>
  );
}

// Blueprint frame around a few words: dashed outline, grid fill, corner handles.
export function BlueprintFrame({ children, className = "" }) {
  return (
    <span className={`bp-frame ${className}`}>
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

// Older name for the filter pills.
export const BoxTabs = ({ label, options, value, onChange }) => <Pills label={label} options={options} value={value} onChange={onChange} />;

// Model size filter: a slider from the smallest size class to "any size".
export const SIZE_STEPS = [1, 2, 4, 8, 16, 32, Infinity];
export const fitsSize = (model, max) => max === Infinity || (model?.params_b != null && model.params_b <= max);

export function SizeSlider({ value, onChange, className = "" }) {
  const id = useId();
  const index = Math.max(0, SIZE_STEPS.indexOf(value));
  return (
    <div className={`flex min-w-[220px] flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="flex items-baseline justify-between text-xs">
        <span className="text-base-content/60">Model size</span>
        <span className="font-semibold">{value === Infinity ? "Any size" : `Up to ${value}B parameters`}</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={SIZE_STEPS.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(SIZE_STEPS[Number(e.target.value)])}
        aria-valuetext={value === Infinity ? "Any size" : `Up to ${value} billion parameters`}
        className="range range-primary range-xs"
      />
      <div className="flex justify-between px-0.5 text-[10px] text-base-content/50" aria-hidden="true">
        {SIZE_STEPS.map((s) => <span key={s}>{s === Infinity ? "Any" : `${s}B`}</span>)}
      </div>
    </div>
  );
}
