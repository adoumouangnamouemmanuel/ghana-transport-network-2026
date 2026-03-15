"use client";

import { addEdge, removeEdge, updateEdge } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";
import SearchableSelect from "./SearchableSelect";

type Action = "add" | "update" | "remove";
type Props = { towns: string[]; onChangeApplied: () => void };

const ACTIONS: { key: Action; label: string; icon: string }[] = [
  { key: "add", label: "Add Road", icon: "+" },
  { key: "update", label: "Update Road", icon: "✎" },
  { key: "remove", label: "Remove Road", icon: "✕" },
];

export default function NetworkEditor({ towns, onChangeApplied }: Props) {
  const [action, setAction] = useState<Action>("add");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  async function apply() {
    if (!source || !target) {
      toast.error("Both Source and Target are required.");
      return;
    }
    if (source === target) {
      toast.error("Source and Target must differ.");
      return;
    }
    const dist = parseInt(distance),
      tMin = parseInt(time);
    if (action !== "remove" && (!dist || !tMin || dist <= 0 || tMin <= 0)) {
      toast.error("Distance and time must be positive numbers.");
      return;
    }
    setLoading(true);
    try {
      const res =
        action === "add"
          ? await addEdge(source, target, dist, tMin)
          : action === "update"
            ? await updateEdge(source, target, dist, tMin)
            : await removeEdge(source, target);
      if (res.success === false) throw new Error(res.message);
      toast.success(res.message || "Done!");
      onChangeApplied();
      setSource("");
      setTarget("");
      setDistance("");
      setTime("");
    } catch (e: any) {
      toast.error(e.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  }

  const BORDER: Record<Action, string> = {
    add: "border-green-900/40",
    update: "border-amber-900/40",
    remove: "border-red-900/40",
  };
  const BTN: Record<Action, string> = {
    add: "bg-green-700 hover:bg-green-600 text-white",
    update: "bg-amber-600 hover:bg-amber-500 text-gray-900",
    remove: "bg-red-700   hover:bg-red-600   text-white",
  };

  return (
    <div className="p-5 max-w-lg space-y-5">
      <h2 className="text-sm font-semibold text-slate-300">Edit Roads</h2>

      {/* Action tabs */}
      <div className="flex gap-1 p-1 bg-[#111827] border border-[#1a2332] rounded-xl">
        {ACTIONS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setAction(key)}
            className={`flex-1 py-2 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              action === key
                ? "bg-[#0f1623] border border-[#1e2d3d] text-slate-100"
                : "text-slate-300 hover:text-slate-100"
            }`}
          >
            <span className="text-[10px]">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className={`card p-5 space-y-4 ${BORDER[action]}`}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
              From
            </label>
            <SearchableSelect
              towns={towns}
              value={source}
              onChange={setSource}
              placeholder="From…"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
              To
            </label>
            <SearchableSelect
              towns={towns}
              value={target}
              onChange={setTarget}
              placeholder="To…"
            />
          </div>
        </div>

        {action !== "remove" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                Distance (km)
              </label>
              <input
                type="number"
                min="1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g. 120"
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#334155] text-slate-100
                           placeholder-slate-500 focus:outline-none focus:border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
                Travel Time (min)
              </label>
              <input
                type="number"
                min="1"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 90"
                className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#334155] text-slate-100
                           placeholder-slate-500 focus:outline-none focus:border-slate-300 text-sm"
              />
            </div>
          </div>
        )}

        <button
          onClick={apply}
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${BTN[action]}`}
        >
          {loading
            ? "Applying…"
            : `${ACTIONS.find((a) => a.key === action)?.icon} ${ACTIONS.find((a) => a.key === action)?.label}`}
        </button>
      </div>

      {/* Notes */}
      <div className="card p-4 text-xs text-slate-300 space-y-1.5">
        <p className="font-semibold text-slate-100 mb-1">Notes</p>
        <p>• Roads are bidirectional — both directions are affected.</p>
        <p>• New towns are created automatically when needed.</p>
        <p>• Changes are in-memory only and reset on server restart.</p>
      </div>
    </div>
  );
}
