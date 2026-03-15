"use client";

import NetworkEditor from "@/components/NetworkEditor";
import RouteResults from "@/components/RouteResults";
import SearchableSelect from "@/components/SearchableSelect";
import StatsSidebar from "@/components/StatsSidebar";
import { fetchGraph, fetchStats, fetchTowns } from "@/lib/api";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const NetworkGraph = dynamic(() => import("@/components/NetworkGraph"), {
  ssr: false,
});

type Tab = "routes" | "graph" | "editor";

// Onboarding Modal Component
function OnboardingModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    localStorage.setItem("gt_onboarded", "true");
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07090f]/80 backdrop-blur-sm fade-in">
      <div className="glass-lighter max-w-md w-full p-8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-amber-500/10 pointer-events-none" />
        <div className="relative z-10 space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-gray-900 font-black text-2xl tracking-tight shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            GT
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Ghana Transport</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Explore optimal routes between towns with interactive physics.
            </p>
          </div>
          
          <div className="space-y-3 text-left bg-black/20 rounded-xl p-4 border border-white/5">
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-lg">⇌</span>
              <p className="text-xs text-slate-300"><strong className="text-white">Select towns</strong> in the top header to automatically analyze shortest and fastest routes.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-lg">◉</span>
              <p className="text-xs text-slate-300"><strong className="text-white">Explore the Network</strong> tab to interact with a 3D physical simulation of the roads. Click nodes to lock them in as route endpoints.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-lg">✎</span>
              <p className="text-xs text-slate-300"><strong className="text-white">Edit real-time</strong> using the Editor tab to update distances and travel times. Routes recalculate instantly.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02]"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [towns, setTowns] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<{ edges: any[] }>({ edges: [] });
  const [stats, setStats] = useState<any>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routePath, setRoutePath] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("routes");
  const [graphMounted, setGraphMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("gt_onboarded")) {
      setShowOnboarding(true);
    }
  }, []);

  const loadGraph = useCallback(async () => {
    const [g, s] = await Promise.all([fetchGraph(), fetchStats()]);
    setGraphData(g);
    setStats(s);
  }, []);

  useEffect(() => {
    fetchTowns().then(setTowns).catch(console.error);
    loadGraph().catch(console.error);
  }, [loadGraph]);

  // If we are on the graph tab and have both from and to, but no route path, 
  // explicitly fetch the shortest path to ensure the lines draw immediately 
  // without needing the Routes tab to manage it.
  useEffect(() => {
     if (tab === "graph" && from && to) {
        let cancelled = false;
        
        import("@/lib/api").then(({ fetchShortest }) => {
           fetchShortest(from, to).then(res => {
              if (cancelled) return;
              if (res?.path && !res.error) {
                 setRoutePath(res.path);
              }
           }).catch(console.error);
        });

        return () => { cancelled = true; };
     } else if (!from || !to) {
        setRoutePath([]);
     }
  }, [from, to, tab]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleTabChange = (key: Tab) => {
    if (key === "graph") setGraphMounted(true);
    setTab(key);
  };

  // When a node is clicked in the graph: set from/to but stay on graph tab
  const handleNodeClick = (town: string) => {
    if (!from) {
      setFrom(town);
    } else if (!to) {
      setTo(town);
    } else {
      setFrom(town);
      setTo("");
    }
  };

  const TABS = [
    { key: "routes" as Tab, icon: "⇌", label: "Routes" },
    { key: "graph" as Tab, icon: "◉", label: "Network" },
    { key: "editor" as Tab, icon: "", label: "Edit Roads" },
  ];

  return (
    <div className="min-h-screen flex flex-col text-slate-200 relative overflow-hidden animated-bg">
      {/* Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Onboarding Modal Overlay */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      {/* ── Header Island ── */}
      <div className="pt-4 px-4 sm:px-6 w-full max-w-screen-2xl mx-auto absolute top-0 left-0 right-0 z-50">
        <header className="glass rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2 px-3 relative border border-white/10">
          <div className="h-[52px] flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0 group cursor-pointer pl-2">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-gray-900 font-black text-xs tracking-tighter shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-shadow">
                GT
              </div>
              <h1 className="text-xl font-bold text-white hidden sm:block tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                Ghana Transport
              </h1>
            </div>

            <div className="w-px h-6 bg-white/10 hidden lg:block mx-2" />

          {/* Town selectors */}
          <div className="flex items-center gap-2 flex-1 max-w-xl">
            <div className="flex-1 min-w-0">
              <SearchableSelect
                towns={towns}
                value={from}
                onChange={setFrom}
                placeholder="From…"
              />
            </div>
            <button
              onClick={swap}
              title="Swap"
              className="flex-shrink-0 w-9 h-9 rounded-xl btn-glass text-slate-300
                         hover:text-amber-400 flex items-center justify-center text-lg"
            >
              ⇄
            </button>
            <div className="flex-1 min-w-0">
              <SearchableSelect
                towns={towns}
                value={to}
                onChange={setTo}
                placeholder="To…"
              />
            </div>
          </div>

          {/* Route indicator */}
          {from && to && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-slate-200 font-medium truncate max-w-[80px]">
                {from}
              </span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-200 font-medium truncate max-w-[80px]">
                {to}
              </span>
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
          )}

            {/* Tabs - Segmented Control */}
            <nav className="flex gap-1 flex-shrink-0 bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
              {TABS.map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                    tab === key
                      ? "bg-amber-500 text-gray-900 shadow-[0_2px_10px_rgba(245,158,11,0.4)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-sm opacity-80">{icon}</span>
                  <span className="hidden md:inline tracking-wide">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden relative z-10 pt-[88px]">
        {/* Left sidebar */}
        <aside className="w-[300px] flex-shrink-0 overflow-y-auto p-4 hidden lg:block border-r border-white/5 bg-black/10 backdrop-blur-xl">
          <StatsSidebar stats={stats} from={from} to={to} />
        </aside>

        {/* Main content — keep all tabs mounted to preserve state */}
        <main className="flex-1 overflow-hidden relative">
          {/* Routes tab */}
          <div
            className={
              tab === "routes" ? "block h-full overflow-y-auto" : "hidden"
            }
          >
            <RouteResults from={from} to={to} onRouteHighlight={setRoutePath} />
          </div>

          {/* Network graph tab — mount once, never unmount */}
          <div className={tab === "graph" ? "block h-full" : "hidden"}>
            {graphMounted && (
              <NetworkGraph
                graphData={graphData}
                routePath={routePath}
                from={from}
                to={to}
                onNodeClick={handleNodeClick}
              />
            )}
          </div>

          {/* Editor tab */}
          <div
            className={
              tab === "editor" ? "block h-full overflow-y-auto" : "hidden"
            }
          >
            <NetworkEditor
              towns={towns}
              onChangeApplied={() => {
                loadGraph();
                fetchTowns().then(setTowns);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
