"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  towns: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

export default function SearchableSelect({
  towns,
  value,
  onChange,
  placeholder = "Search town...",
}: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered =
    query.length < 1
      ? towns
      : towns.filter((t) => t.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
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
        className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1e2a3a] text-slate-200
                     placeholder-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-1
                     focus:ring-amber-500/20 transition-all text-sm"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />
      {open && filtered.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto rounded-lg bg-slate-900
                         border border-[#1e2a3a] shadow-2xl"
          style={{ background: "#0d1117" }}
        >
          {filtered.map((town) => (
            <li
              key={town}
              onMouseDown={() => {
                onChange(town);
                setQuery(town);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-[#111827]
                            ${town === value ? "text-amber-400" : "text-slate-300"}`}
            >
              {town}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
