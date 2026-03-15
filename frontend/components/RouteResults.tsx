"use client";

import { useState, useEffect } from "react";
import { fetchShortest, fetchFastest, fetchTop3 } from "@/lib/api";

type SingleRoute = { path: string[]; totalDistance: number; totalTime: number; error?: string };
type RouteRank = {
  rank: number; path: string[]; totalDistance: number; totalTime: number;
  distanceCost: number; timeCost: number; totalCost: number;
};
type Top3Result = { routes: RouteRank[]; recommendation: { rank: number; reason: string } };

type Props = { from: string; to: string; onRouteHighlight: (path: string[]) => void };

type RouteMode = "shortest" | "fastest" | "top3";

function PathChain({ path, highlight = false }: { path: string[]; highlight?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {path.map((town, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className={`path-pill ${highlight ? "active" : ""}`}>{town}</span>
          {i < path.length - 1 && <span className="text-slate-600 text-xs">→</span>}
        </span>
      ))}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="glass-lighter rounded-lg p-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-base font-bold text-slate-100">{value}</p>
      {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-5 space-y-3 animate-pulse">
      <div className="h-4 shimmer rounded w-1/3" />
      <div className="h-3 shimmer rounded w-full" />
      <div className="h-3 shimmer rounded w-4/5" />
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3].map(i => <div key={i} className="h-10 shimmer rounded-lg" />)}
      </div>
    </div>
  );
}

export default function RouteResults({ from, to, onRouteHighlight }: Props) {
  const [mode, setMode] = useState<RouteMode>("shortest");
  const [shortest, setShortest] = useState<SingleRoute | null>(null);
  const [fastest, setFastest]   = useState<SingleRoute | null>(null);
  const [top3, setTop3]         = useState<Top3Result | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Auto-search whenever both towns are selected
  useEffect(() => {
    if (!from || !to || from === to) {
      setShortest(null); setFastest(null); setTop3(null); setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true); setError(null);
    setShortest(null); setFastest(null); setTop3(null);

    Promise.all([
      fetchShortest(from, to),
      fetchFastest(from, to),
      fetchTop3(from, to),
    ]).then(([s, f, t]) => {
      if (cancelled) return;
      setShortest(s?.error ? null : s);
      setFastest(f?.error ? null : f);
      setTop3(t?.routes?.length ? t : null);
      if (s?.error) setError(s.error);
      // highlight the active route
      const active = { shortest: s, fastest: f }[mode];
      if (active?.path) onRouteHighlight(active.path);
      else if (t?.routes?.[0]) onRouteHighlight(t.routes[0].path);
    }).catch(e => {
      if (!cancelled) setError("Could not reach the backend. Is Spring Boot running on port 8081?");
    }).finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update highlight when mode changes
  useEffect(() => {
    if (mode === "shortest" && shortest?.path) onRouteHighlight(shortest.path);
    else if (mode === "fastest"  && fastest?.path)  onRouteHighlight(fastest.path);
    else if (mode === "top3"     && top3?.routes?.[0]) onRouteHighlight(top3.routes[0].path);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Empty state ──
  if (!from || !to) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-8 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">⇌</div>
        <h2 className="text-lg font-semibold text-slate-300">Select two towns to explore routes</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Use the <strong className="text-slate-400">Start</strong> and <strong className="text-slate-400">End</strong> dropdowns in the header.
          Routes will appear automatically.
        </p>
      </div>
    );
  }

  // ── Error ──
  if (!loading && error) {
    return (
      <div className="p-6">
        <div className="glass rounded-xl p-5 border-red-800/40 border">
          <p className="text-red-400 font-semibold text-sm">⚠ {error}</p>
        </div>
      </div>
    );
  }

  const TABS: { key: RouteMode; label: string; icon: string }[] = [
    { key: "shortest", label: "Shortest Distance", icon: "📏" },
    { key: "fastest",  label: "Fastest Time",      icon: "⚡" },
    { key: "top3",     label: "Top 3 + Cost",      icon: "🏆" },
  ];

  return (
    <div className="p-5 space-y-4">

      {/* ── Route heading ── */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-200 text-sm">
          <span className="text-slate-400">{from}</span>
          <span className="mx-2 text-slate-600">→</span>
          <span className="text-slate-400">{to}</span>
          {loading && <span className="ml-2 text-xs text-amber-500 animate-pulse">Searching…</span>}
        </h2>
        {/* Show stop count for active route */}
        {!loading && shortest && (
          <span className="text-xs text-slate-500">
            {shortest.path.length - 1} leg{shortest.path.length !== 2 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Mode tabs ── */}
      <div className="flex gap-0 border-b border-slate-800">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 -mb-px ${
              mode === key
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="fade-in">
          {mode === "shortest" && shortest && <SingleRouteCard route={shortest} label="Shortest Distance" icon="📏" accent="blue" />}
          {mode === "fastest"  && fastest  && <SingleRouteCard route={fastest}  label="Fastest Time"      icon="⚡" accent="purple" />}
          {mode === "top3"     && top3     && <Top3Cards result={top3} onHighlight={onRouteHighlight} />}
          {((mode === "shortest" && !shortest) || (mode === "fastest" && !fastest) || (mode === "top3" && !top3)) && !loading && (
            <p className="text-slate-500 text-sm">No results for this route type.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
//  Single route card (shortest / fastest)
// ────────────────────────────────────────────────
const ACCENT_COLORS: Record<string, { badge: string; heading: string; border: string }> = {
  blue:   { badge: "bg-blue-950  text-blue-300  border-blue-800",   heading: "text-blue-400",   border: "border-blue-900/40" },
  purple: { badge: "bg-purple-950 text-purple-300 border-purple-800", heading: "text-purple-400", border: "border-purple-900/40" },
  amber:  { badge: "bg-amber-950 text-amber-300  border-amber-800",  heading: "text-amber-400",  border: "border-amber-900/40" },
  green:  { badge: "bg-green-950 text-green-300  border-green-800",  heading: "text-green-400",  border: "border-green-900/40" },
};

function SingleRouteCard({
  route, label, icon, accent,
}: { route: SingleRoute; label: string; icon: string; accent: string }) {
  const c = ACCENT_COLORS[accent] ?? ACCENT_COLORS.blue;
  const distCost = ((route.totalDistance / 8) * 11.95).toFixed(2);
  const timeCost = (route.totalTime * 0.5).toFixed(2);
  const totalCost = ((route.totalDistance / 8) * 11.95 + route.totalTime * 0.5).toFixed(2);
  return (
    <div className={`glass rounded-xl border ${c.border} p-5 space-y-4 hover-lift`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${c.badge}`}>{icon} {label}</span>
      </div>
      <PathChain path={route.path} highlight />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        <Stat label="Distance" value={`${route.totalDistance} km`} />
        <Stat label="Travel Time" value={`${route.totalTime} min`} />
        <Stat label="Stops" value={`${route.path.length - 1}`} sub="legs" />
        <Stat label="Fuel Cost" value={`GHS ${distCost}`} sub="@8km/L · GHS11.95/L" />
        <Stat label="Time Cost" value={`GHS ${timeCost}`} sub="@GHS 0.50/min" />
        <Stat label="Total Cost" value={`GHS ${totalCost}`} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
//  Top 3 cards
// ────────────────────────────────────────────────
function Top3Cards({ result, onHighlight }: { result: Top3Result; onHighlight: (p: string[]) => void }) {
  const [active, setActive] = useState(0);
  const rec = result.recommendation.rank - 1;

  return (
    <div className="space-y-3">
      {/* Quick-pick bar */}
      <div className="flex gap-2">
        {result.routes.map((r, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); onHighlight(r.path); }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
              active === i
                ? "bg-slate-700 border-slate-500 text-slate-100"
                : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
            }`}
          >
            Route #{r.rank}
            {i === rec && <span className="ml-1 text-green-400">★</span>}
          </button>
        ))}
      </div>

      {/* Active route detail */}
      {result.routes.map((r, i) => {
        if (i !== active) return null;
        const isRec = i === rec;
        return (
          <div
            key={i}
            className={`glass rounded-xl border p-5 space-y-4 hover-lift ${
              isRec ? "border-green-800/50" : "border-slate-800/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  i === 0 ? "bg-amber-500 text-gray-900"
                          : i === 1 ? "bg-slate-500 text-white"
                          : "bg-slate-700 text-slate-300"
                }`}>{r.rank}</span>
                Route #{r.rank}
              </span>
              {isRec && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-green-950 text-green-300 border-green-800">
                  ★ RECOMMENDED
                </span>
              )}
            </div>
            <PathChain path={r.path} highlight={isRec} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <Stat label="Distance"    value={`${r.totalDistance} km`} />
              <Stat label="Travel Time" value={`${r.totalTime} min`} />
              <Stat label="Stops"       value={`${r.path.length - 1}`} sub="legs" />
              <Stat label="Fuel Cost"   value={`GHS ${r.distanceCost.toFixed(2)}`} />
              <Stat label="Time Cost"   value={`GHS ${r.timeCost.toFixed(2)}`} />
              <Stat label="Total Cost"  value={`GHS ${r.totalCost.toFixed(2)}`} />
            </div>
          </div>
        );
      })}

      {/* Summary comparison bar */}
      <div className="glass rounded-xl p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Quick Comparison</p>
        <div className="divide-y divide-slate-800">
          {result.routes.map((r, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); onHighlight(r.path); }}
              className={`w-full grid grid-cols-4 gap-2 py-2 text-xs text-left transition-colors rounded px-1
                          ${active === i ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}`}
            >
              <span className="font-semibold">{i === rec ? "★ " : ""}Route #{r.rank}</span>
              <span>{r.totalDistance} km</span>
              <span>{r.totalTime} min</span>
              <span className={i === rec ? "text-green-400 font-bold" : ""}>GHS {r.totalCost.toFixed(2)}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-600 px-1">
          <span>Route</span><span>Distance</span><span>Time</span><span>Total Cost</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 px-1">
        ★ Recommended: {result.recommendation.reason} · ⛽ 8km/L · GHS 11.95/L · ⏱ GHS 0.50/min
      </p>
    </div>
  );
}
