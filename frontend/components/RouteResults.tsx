"use client";

import { fetchFastest, fetchShortest, fetchTop3 } from "@/lib/api";
import { useEffect, useState } from "react";

type SingleRoute = {
  path: string[];
  totalDistance: number;
  totalTime: number;
  error?: string;
};
type RouteRank = {
  rank: number;
  path: string[];
  totalDistance: number;
  totalTime: number;
  distanceCost: number;
  timeCost: number;
  totalCost: number;
};
type Top3Result = {
  routes: RouteRank[];
  recommendation: { rank: number; reason: string };
};

type Props = {
  from: string;
  to: string;
  onRouteHighlight: (path: string[]) => void;
};

type RouteMode = "shortest" | "fastest" | "top3";

function PathChain({ path }: { path: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center mt-2">
      {path.map((town, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="px-2 py-1 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)] whitespace-nowrap">
            {town}
          </span>
          {i < path.length - 1 && (
            <span className="text-slate-500 text-[9px] opacity-60">➔</span>
          )}
        </span>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="stat-box">
      <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">
        {label}
      </p>
      <p
        className={`text-sm font-bold bg-white/5 px-2 py-1 rounded border border-white/5 text-center ${highlight ? "text-amber-400 border-amber-500/20" : "text-slate-100"}`}
      >
        {value}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3 animate-pulse">
      <div className="h-4 shimmer rounded w-1/3" />
      <div className="h-3 shimmer rounded w-full" />
      <div className="h-3 shimmer rounded w-4/5" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 shimmer rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="card p-5 text-sm text-slate-300">
      No route found for this selection.
    </div>
  );
}

export default function RouteResults({ from, to, onRouteHighlight }: Props) {
  const [mode, setMode] = useState<RouteMode>("shortest");
  const [shortest, setShortest] = useState<SingleRoute | null>(null);
  const [fastest, setFastest] = useState<SingleRoute | null>(null);
  const [top3, setTop3] = useState<Top3Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-search whenever both towns are selected
  useEffect(() => {
    if (!from || !to || from === to) {
      setShortest(null);
      setFastest(null);
      setTop3(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setShortest(null);
    setFastest(null);
    setTop3(null);

    Promise.all([
      fetchShortest(from, to),
      fetchFastest(from, to),
      fetchTop3(from, to),
    ])
      .then(([s, f, t]) => {
        if (cancelled) return;
        
        // Check if the backend returned a general Spring error (e.g. 500 or 400)
        const isSpringError = (res: any) => res?.error && typeof res.error === 'string' && (res.status === 400 || res.status === 500);
        // Check if it's our custom API error
        const isApiError = (res: any) => res?.error && typeof res.error === 'string';

        const sh = isSpringError(s) || isApiError(s) || !s?.path ? null : s;
        const fa = isSpringError(f) || isApiError(f) || !f?.path ? null : f;
        const t3 = isSpringError(t) || isApiError(t) || !t?.routes?.length ? null : t;
        
        setShortest(sh);
        setFastest(fa);
        setTop3(t3);
        
        // Only set error if all three failed and it's a structural error
        if (!sh && !fa && !t3 && (s?.error || s?.status)) {
           setError(typeof s.error === 'string' ? s.error : "No viable path found between these towns.");
        }

        // Always highlight a valid path if one exists, prioritizing shortest
        const bestPath = sh?.path || fa?.path || t3?.routes?.[0]?.path;
        
        if (bestPath) {
          onRouteHighlight(bestPath);
        } else {
          onRouteHighlight([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Route fetch error:", err);
          setError("Cannot reach backend or path not found.");
          onRouteHighlight([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update highlight when mode changes, but only if the route is actually available
  useEffect(() => {
    if (loading) return;
    let pathToHighlight: string[] | undefined = undefined;

    if (mode === "shortest") pathToHighlight = shortest?.path;
    else if (mode === "fastest") pathToHighlight = fastest?.path;
    else if (mode === "top3") pathToHighlight = top3?.routes?.[0]?.path;

    // Fallback if the selected mode is unavailable but another is
    if (!pathToHighlight) {
       pathToHighlight = shortest?.path || fastest?.path || top3?.routes?.[0]?.path;
    }

    if (pathToHighlight) {
      onRouteHighlight(pathToHighlight);
    } else {
      onRouteHighlight([]);
    }
  }, [mode, shortest, fastest, top3, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!from || !to) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-5 px-8">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-3xl text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] animate-pulse">
          ⇌
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-base font-semibold text-slate-300">
            Pick a start and end town
          </h2>
          <p className="text-sm text-slate-400 max-w-xs">
            Use the dropdowns above — routes load automatically.
          </p>
        </div>
      </div>
    );
  }

  if (!loading && error) {
    return (
      <div className="p-6">
        <div
          className="card p-5"
          style={{ borderColor: "rgb(127 29 29 / 0.5)" }}
        >
          <p className="text-red-400 font-semibold text-sm">⚠ {error}</p>
        </div>
      </div>
    );
  }

  const MODES: { key: RouteMode; label: string; icon: string }[] = [
    { key: "shortest", label: "Shortest", icon: "" },
    { key: "fastest", label: "Fastest", icon: "" },
    { key: "top3", label: "Top 3", icon: "" },
  ];

  return (
    <div className="p-5 space-y-4 max-w-3xl">
      {/* Heading */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="font-medium text-slate-300">{from}</span>
          </span>
          <span className="text-slate-500">→</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="font-medium text-slate-300">{to}</span>
          </span>
        </div>
        {loading && (
          <span className="text-xs text-amber-500 animate-pulse">
            Calculating…
          </span>
        )}
      </div>

      {/* Mode picker */}
      <div className="flex gap-1 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-fit shadow-lg">
        {MODES.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
              mode === key
                ? "bg-white/10 border border-white/20 text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] transform scale-105"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 transparent border border-transparent"
            }`}
          >
            <span className="text-sm">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="fade-in">
          {mode === "shortest" &&
            (shortest ? (
              <SingleRouteCard
                route={shortest}
                label="Shortest Distance"
                accent="blue"
              />
            ) : (
              <EmptyResult />
            ))}
          {mode === "fastest" &&
            (fastest ? (
              <SingleRouteCard
                route={fastest}
                label="Fastest Time"
                accent="purple"
              />
            ) : (
              <EmptyResult />
            ))}
          {mode === "top3" &&
            (top3 ? (
              <Top3Cards result={top3} onHighlight={onRouteHighlight} />
            ) : (
              <EmptyResult />
            ))}
        </div>
      )}
    </div>
  );
}

const ACCENTS: Record<string, { dot: string; label: string }> = {
  blue: { dot: "bg-blue-500", label: "text-blue-400" },
  purple: { dot: "bg-purple-500", label: "text-purple-400" },
  green: { dot: "bg-green-500", label: "text-green-400" },
};

function SingleRouteCard({
  route,
  label,
  accent,
}: {
  route: SingleRoute;
  label: string;
  accent: string;
}) {
  const c = ACCENTS[accent] ?? ACCENTS.blue;
  const fuelCost = ((route.totalDistance / 8) * 11.95).toFixed(2);
  const timeCost = (route.totalTime * 0.5).toFixed(2);
  const totalCost = (
    (route.totalDistance / 8) * 11.95 +
    route.totalTime * 0.5
  ).toFixed(2);
  return (
    <div className="card hover-lift p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-xs font-semibold ${c.label}`}>{label}</span>
        <span className="ml-auto text-xs text-slate-400">
          {route.path.length - 1} legs
        </span>
      </div>
      <PathChain path={route.path} />
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Distance" value={`${route.totalDistance} km`} />
        <Stat label="Time" value={`${route.totalTime} min`} />
        <Stat label="Stops" value={route.path.length - 1} />
      </div>
      <div className="border-t border-white/10 pt-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">
          Cost estimate
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Fuel" value={`GHS ${fuelCost}`} />
          <Stat label="Time cost" value={`GHS ${timeCost}`} />
          <Stat label="Total" value={`GHS ${totalCost}`} highlight />
        </div>
        <p className="text-[10px] text-slate-400 mt-2">
          ⛽ 8 km/L · GHS 11.95/L · ⏱ GHS 0.50/min
        </p>
      </div>
    </div>
  );
}

function Top3Cards({
  result,
  onHighlight,
}: {
  result: Top3Result;
  onHighlight: (p: string[]) => void;
}) {
  const [active, setActive] = useState(0);
  const rec = result.recommendation.rank - 1;
  const RANK = [
    { dot: "bg-amber-500", label: "text-amber-400" },
    { dot: "bg-slate-500", label: "text-slate-400" },
    { dot: "bg-slate-500", label: "text-slate-300" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {result.routes.map((r, i) => (
          <button
            key={i}
            onClick={() => {
              setActive(i);
              onHighlight(r.path);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-300 ${
              active === i
                ? "bg-white/10 border-white/30 text-white shadow-[0_4px_15px_rgba(0,0,0,0.3)] transform scale-105"
                : "border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            Route {r.rank}
            {i === rec ? " ★" : ""}
          </button>
        ))}
      </div>

      {result.routes.map((r, i) => {
        if (i !== active) return null;
        const isRec = i === rec;
        const s = RANK[i] ?? RANK[2];
        return (
          <div key={i} className="card hover-lift p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className={`text-xs font-semibold ${s.label}`}>
                  Route #{r.rank}
                </span>
              </div>
              {isRec && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-green-950/60 text-green-400 border border-green-900/50">
                  ★ Recommended
                </span>
              )}
            </div>
            <PathChain path={r.path} />
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Distance" value={`${r.totalDistance} km`} />
              <Stat label="Time" value={`${r.totalTime} min`} />
              <Stat label="Stops" value={r.path.length - 1} />
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold">
                Cost estimate
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Fuel" value={`GHS ${r.distanceCost.toFixed(2)}`} />
                <Stat
                  label="Time cost"
                  value={`GHS ${r.timeCost.toFixed(2)}`}
                />
                <Stat
                  label="Total"
                  value={`GHS ${r.totalCost.toFixed(2)}`}
                  highlight
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="card p-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
          Comparison
        </p>
        <div className="space-y-0.5">
          <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 px-2 pb-1.5 border-b border-[#1a2332]">
            <span>Route</span>
            <span>Distance</span>
            <span>Time</span>
            <span>Total</span>
          </div>
          {result.routes.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i);
                onHighlight(r.path);
              }}
              className={`w-full grid grid-cols-4 gap-2 py-1.5 px-2 text-xs rounded-lg transition-colors ${
                active === i
                  ? "bg-[#111827] text-slate-100"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              <span className="font-medium">
                {i === rec ? "★ " : ""}#{r.rank}
              </span>
              <span>{r.totalDistance} km</span>
              <span>{r.totalTime} min</span>
              <span className={i === rec ? "text-green-400 font-semibold" : ""}>
                GHS {r.totalCost.toFixed(0)}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2.5">
          ★ {result.recommendation.reason}
        </p>
      </div>
    </div>
  );
}
