"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Option = {
  value: string;
  label: string;
  sublabel?: string;
};

export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  const display = open ? query : selected?.label ?? "";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        value={display}
        placeholder={selected ? selected.label : placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        className="w-full rounded-lg border border-white/15 bg-[#12151c] px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40"
      />
      {open && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-white/10 bg-[#12151c] p-1 shadow-xl">
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500">No results</p>
          )}
          {filtered.map((o) => (
            <button
              type="button"
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
                setQuery("");
                inputRef.current?.blur();
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/10 ${
                o.value === value ? "bg-white/5 text-amber-300" : "text-gray-200"
              }`}
            >
              <span className="truncate">{o.label}</span>
              {o.sublabel && <span className="shrink-0 text-xs text-gray-500">{o.sublabel}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
