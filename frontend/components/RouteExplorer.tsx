"use client";

import { useState, useEffect } from "react";
import SearchableSelect from "./SearchableSelect";
import { fetchShortest, fetchFastest, fetchTop3 } from "@/lib/api";
import toast from "react-hot-toast";

type Mode = "shortest" | "fastest" | "top3";

type SingleRoute = { path: string[]; totalDistance: number; totalTime: number };
type Top3Result = {
  routes: Array<{
    rank: number; path: string[]; totalDistance: number; totalTime: number;
    distanceCost: number; timeCost: number; totalCost: number;
  }>;
  recommendation: { rank: number; reason: string };
};

type Props = {
  towns: string[];
  onRouteFound: (path: string[]) => void;
  clickedNode: { town: string; role: "from" | "to" } | null;
  onClearClickedNode: () => void;
};

function PathChain({ path }: { path: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 text-sm fade-in">
      {path.map((town, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="px-2.5 py-1 rounded-md bg-slate-700 text-slate-100 font-medium border border-slate-600">
            {town}
          </span>
          {i < path.length - 1 && (
            <span className="text-amber-500 font-bold text-base">→</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default function RouteExplorer({ towns, onRouteFound, clickedNode, onClearClickedNode }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState<Mode>("shortest");
  const [loading, setLoading] = useState(false);
  const [single, setSingle] = useState<SingleRoute | null>(null);
  const [top3, setTop3] = useState<Top3Result | null>(null);

  // Apply graph node clicks
  useEffect(() => {
    if (!clickedNode) return;
    if (clickedNode.role === "from") setFrom(clickedNode.town);
    else setTo(clickedNode.town);
    onClearClickedNode();
  }, [clickedNode, onClearClickedNode]);

  async function search() {
    if (!from || !to) { toast.error("Choose both Start and End towns."); return; }
    if (from === to) { toast.error("Start and End must be different towns."); return; }
    setLoading(true); setSingle(null); setTop3(null);
    try {
      if (mode === "shortest") {
        const data = await fetchShortest(from, to);
        if (data.error) throw new Error(data.error);
        setSingle(data); onRouteFound(data.path);
      } else if (mode === "fastest") {
        const data = await fetchFastest(from, to);
        if (data.error) throw new Error(data.error);
        setSingle(data); onRouteFound(data.path);
      } else {
        const data = await fetchTop3(from, to);
        if (!data.routes?.length) throw new Error("No routes found.");
        setTop3(data); onRouteFound(data.routes[0].path);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch route.");
    } finally {
      setLoading(false);
    }
  }

  const MODES: { key: Mode; label: string }[] = [
    { key: "shortest", label: "Shortest Distance" },
    { key: "fastest", label: "Fastest Time" },
    { key: "top3", label: "Top 3 Routes" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-6 space-y-5">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="text-amber-400">⟳</span> Route Explorer
        </h2>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Start Town</label>
            <SearchableSelect towns={towns} value={from} onChange={setFrom} placeholder="From..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">End Town</label>
            <SearchableSelect towns={towns} value={to} onChange={setTo} placeholder="To..." />
          </div>
        </div>

        {/* Mode toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search Type</label>
          <div className="flex flex-wrap gap-2">
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  mode === key
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                    : "text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <button
          onClick={search}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all
                     bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400
                     text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                     hover:shadow-amber-500/20"
        >
          {loading ? "Searching..." : "Search Route"}
        </button>
      </div>

      {/* Single route result */}
      {single && (
        <div className="glass rounded-2xl p-6 space-y-4 fade-in">
          <h3 className="text-base font-semibold text-slate-300">
            {mode === "shortest" ? "🏁 Shortest Distance" : "Fastest Time"} — {from} → {to}
          </h3>
          <PathChain path={single.path} />
          <div className="flex flex-wrap gap-4 pt-2">
            <StatBadge label="Total Distance" value={`${single.totalDistance} km`} color="amber" />
            <StatBadge label="Travel Time" value={`${single.totalTime} min`} color="blue" />
            <StatBadge label="Stops" value={`${single.path.length - 1} legs`} color="purple" />
          </div>
        </div>
      )}

      {/* Top 3 results */}
      {top3 && (
        <div className="space-y-4 fade-in">
          <h3 className="text-base font-semibold text-slate-300">🏆 Top 3 Routes — {from} → {to}</h3>
          {top3.routes.map((r) => {
            const isRecommended = r.rank === top3.recommendation.rank;
            return (
              <div
                key={r.rank}
                className={`glass rounded-2xl p-5 space-y-3 transition-all ${
                  isRecommended ? "border-green-500/60 ring-1 ring-green-500/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold text-slate-200">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                      r.rank === 1 ? "bg-amber-500 text-gray-900" :
                      r.rank === 2 ? "bg-slate-500 text-white" : "bg-orange-800 text-white"
                    }`}>{r.rank}</span>
                    Route #{r.rank}
                  </span>
                  {isRecommended && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      ✓ Recommended
                    </span>
                  )}
                </div>
                <PathChain path={r.path} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <StatBadge label="Distance" value={`${r.totalDistance} km`} color="amber" />
                  <StatBadge label="Time" value={`${r.totalTime} min`} color="blue" />
                  <StatBadge label="Fuel Cost" value={`GHS ${r.distanceCost.toFixed(2)}`} color="orange" />
                  <StatBadge label="Time Cost" value={`GHS ${r.timeCost.toFixed(2)}`} color="purple" />
                  <StatBadge label="Total Cost" value={`GHS ${r.totalCost.toFixed(2)}`} color="green" />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-slate-500 italic px-1">
            💡 {top3.recommendation.reason}. Fuel: 8 km/L @ GHS 11.95/L · Time: GHS 0.50/min
          </p>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    green: "bg-green-500/10 text-green-300 border-green-500/20",
  };
  return (
    <div className={`rounded-lg px-3 py-2 border ${colors[color] || colors.amber}`}>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}
