"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  towns: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

export default function SearchableSelect({ towns, value, onChange, placeholder = "Search town..." }: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length < 1
    ? towns
    : towns.filter((t) => t.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100
                   placeholder-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-1
                   focus:ring-amber-500/40 transition-all text-sm"
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto rounded-lg bg-slate-900
                       border border-slate-700 shadow-2xl">
          {filtered.map((town) => (
            <li
              key={town}
              onMouseDown={() => { onChange(town); setQuery(town); setOpen(false); }}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-slate-800
                          ${town === value ? "text-amber-400 bg-slate-800/60" : "text-slate-200"}`}
            >
              {town}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
