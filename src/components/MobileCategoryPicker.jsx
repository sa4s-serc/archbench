/* eslint-disable react/prop-types */
import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

const MobileCategoryPicker = ({
  label,
  items,
  selectedIdx,
  open,
  onOpenChange,
  onSelect,
  getMeta,
  getSubtext,
}) => {
  const [query, setQuery] = useState("");
  const selected = items[selectedIdx] || items[0];
  const selectedMeta = selected ? getMeta(selected) : null;
  const SelectedIcon = selectedMeta?.icon;
  const filteredItems = items
    .map((item, idx) => ({ item, idx, meta: getMeta(item) }))
    .filter(({ item, meta }) => {
      const searchText = [
        meta.title,
        meta.subtext,
        getSubtext ? getSubtext(item) : "",
      ]
        .join(" ")
        .toLowerCase();
      return searchText.includes(query.trim().toLowerCase());
    });

  return (
    <div className="md:hidden mb-5 rounded-xl border border-base-300/50 bg-base-200/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40">
        {label}
      </p>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="mt-2 flex w-full items-center gap-3 rounded-lg border border-base-300/60 bg-base-100 px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        {SelectedIcon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SelectedIcon size={16} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {selectedMeta?.title}
          </span>
          {selectedMeta?.subtext && (
            <span className="block truncate text-[11px] text-base-content/45">
              {selectedMeta.subtext}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-base-content/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-base-300/50 bg-base-100/80 p-1">
          <div className="sticky top-0 z-10 bg-base-100/95 p-1">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/35"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${label.toLowerCase().replace("choose ", "")}...`}
                className="input input-bordered input-sm w-full rounded-lg bg-base-200/50 pl-9 pr-8 text-xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/35 hover:text-base-content"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {filteredItems.map(({ item, idx, meta }) => {
            const Icon = meta.icon;
            const active = idx === selectedIdx;
            return (
              <button
                type="button"
                key={meta.key}
                onClick={() => {
                  onSelect(idx);
                  setQuery("");
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/65 hover:bg-base-200"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-primary/15" : "bg-base-300/60"
                  }`}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight">
                    {meta.title}
                  </span>
                  {getSubtext && (
                    <span className="block truncate text-[11px] text-base-content/45">
                      {getSubtext(item)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-base-content/40">
              No matches found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileCategoryPicker;
