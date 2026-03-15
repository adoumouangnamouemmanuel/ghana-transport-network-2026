"use client";

import { useState } from "react";
import SearchableSelect from "./SearchableSelect";
import { addEdge, updateEdge, removeEdge } from "@/lib/api";
import toast from "react-hot-toast";

type Action = "add" | "update" | "remove";
type Props = { towns: string[]; onChangeApplied: () => void };

const ACTIONS: { key: Action; label: string; icon: string }[] = [
  { key: "add",    label: "Add Road",    icon: "+" },
  { key: "update", label: "Update Road", icon: "✎" },
  { key: "remove", label: "Remove Road", icon: "✕" },
];

export default function NetworkEditor({ towns, onChangeApplied }: Props) {
  const [action,   setAction]   = useState<Action>("add");
  const [source,   setSource]   = useState("");
  const [target,   setTarget]   = useState("");
  const [distance, setDistance] = useState("");
  const [time,     setTime]     = useState("");
  const [loading,  setLoading]  = useState(false);

  async function apply() {
    if (!source || !target) { toast.error("Both Source and Target are required."); return; }
    if (source === target)  { toast.error("Source and Target must differ."); return; }
    const dist = parseInt(distance), tMin = parseInt(time);
    if (action !== "remove" && (!dist || !tMin || dist <= 0 || tMin <= 0)) {
      toast.error("Distance and time must be positive numbers."); return;
    }
    setLoading(true);
    try {
      const res = action === "add"    ? await addEdge(source, target, dist, tMin)
                : action === "update" ? await updateEdge(source, target, dist, tMin)
                :                      await removeEdge(source, target);
      if (res.success === false) throw new Error(res.message);
      toast.success(res.message || "Done!");
      onChangeApplied();
      setSource(""); setTarget(""); setDistance(""); setTime("");
    } catch (e: any) {
      toast.error(e.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  }

  const BORDER: Record<Action, string> = {
    add:    "border-green-800/60 bg-green-950/30",
    update: "border-amber-800/60 bg-amber-950/20",
    remove: "border-red-800/60   bg-red-950/20",
  };
  const BTN: Record<Action, string> = {
    add:    "bg-green-700  hover:bg-green-600  text-white",
    update: "bg-amber-600  hover:bg-amber-500  text-gray-900",
    remove: "bg-red-700    hover:bg-red-600    text-white",
  };

  return (
    <div className="p-5 max-w-xl space-y-5">
      <h2 className="text-sm font-semibold text-slate-300">Edit Road Network</h2>

      {/* Action tabs */}
      <div className="flex gap-1 p-1 glass rounded-lg">
        {ACTIONS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setAction(key)}
            className={`flex-1 py-2 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              action === key
                ? "bg-slate-700 text-slate-100 border border-slate-600"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="text-[10px]">{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className={`glass rounded-xl border p-5 space-y-4 ${BORDER[action]}`}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Source Town</label>
            <SearchableSelect towns={towns} value={source} onChange={setSource} placeholder="From…" />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target Town</label>
            <SearchableSelect towns={towns} value={target} onChange={setTarget} placeholder="To…" />
          </div>
        </div>

        {action !== "remove" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Distance (km)</label>
              <input
                type="number" min="1" value={distance} onChange={e => setDistance(e.target.value)}
                placeholder="e.g. 120"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100
                           placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Travel Time (min)</label>
              <input
                type="number" min="1" value={time} onChange={e => setTime(e.target.value)}
                placeholder="e.g. 90"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100
                           placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm"
              />
            </div>
          </div>
        )}

        <button
          onClick={apply} disabled={loading}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${BTN[action]}`}
        >
          {loading ? "Applying…" : `${ACTIONS.find(a => a.key === action)?.icon} ${ACTIONS.find(a => a.key === action)?.label}`}
        </button>
      </div>

      {/* Notes */}
      <div className="glass rounded-xl p-4 text-xs text-slate-500 space-y-1.5">
        <p className="font-semibold text-slate-400">Notes</p>
        <p>• All roads are <strong className="text-slate-300">bidirectional</strong> — both directions affected.</p>
        <p>• New towns are created automatically when adding a road to them.</p>
        <p>• Changes are <strong className="text-slate-300">in-memory only</strong> and reset on server restart.</p>
      </div>
    </div>
  );
}
