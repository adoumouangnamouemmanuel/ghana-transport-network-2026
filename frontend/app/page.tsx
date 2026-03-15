"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import StatsSidebar from "@/components/StatsSidebar";
import { fetchTowns, fetchGraph, fetchStats } from "@/lib/api";
import SearchableSelect from "@/components/SearchableSelect";
import RouteResults from "@/components/RouteResults";
import NetworkEditor from "@/components/NetworkEditor";

const NetworkGraph = dynamic(() => import("@/components/NetworkGraph"), { ssr: false });

type Tab = "routes" | "graph" | "editor";

export default function Home() {
  const [towns, setTowns] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<{ edges: any[] }>({ edges: [] });
  const [stats, setStats] = useState<any>(null);
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const [routePath, setRoutePath] = useState<string[]>([]);
  const [tab, setTab]   = useState<Tab>("routes");

  const loadGraph = useCallback(async () => {
    const [g, s] = await Promise.all([fetchGraph(), fetchStats()]);
    setGraphData(g);
    setStats(s);
  }, []);

  useEffect(() => {
    fetchTowns().then(setTowns).catch(console.error);
    loadGraph().catch(console.error);
  }, [loadGraph]);

  // Swap towns
  const swap = () => { setFrom(to); setTo(from); };

  const TABS = [
    { key: "routes" as Tab, icon: "⇌", label: "Routes" },
    { key: "graph"  as Tab, icon: "◉", label: "Network Map" },
    { key: "editor" as Tab, icon: "✎", label: "Edit Roads" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-200">

      {/* ── Header ── */}
      <header className="glass border-b border-slate-800/60 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-gray-900 font-black text-sm">GT</div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-tight">Ghana Transport Network</h1>
              <p className="text-xs text-slate-500">183 towns · 551 roads</p>
            </div>
          </div>

          {/* ── Town selector always in header ── */}
          <div className="flex items-center gap-2 flex-1 max-w-2xl">
            <div className="flex-1">
              <SearchableSelect towns={towns} value={from} onChange={setFrom} placeholder="Start town…" />
            </div>
            <button
              onClick={swap}
              title="Swap towns"
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400
                         hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600 transition-all flex items-center justify-center text-sm"
            >⇄</button>
            <div className="flex-1">
              <SearchableSelect towns={towns} value={to} onChange={setTo} placeholder="End town…" />
            </div>
          </div>

          {/* ── Tabs ── */}
          <nav className="flex gap-1 flex-shrink-0">
            {TABS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  tab === key
                    ? "bg-amber-500 text-gray-900"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span>{icon}</span>{label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">

        {/* Left sidebar: stats */}
        <aside className="w-56 flex-shrink-0 border-r border-slate-800/60 overflow-y-auto p-4 hidden lg:block">
          <StatsSidebar stats={stats} from={from} to={to} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {tab === "routes" && (
            <RouteResults
              from={from} to={to}
              onRouteHighlight={setRoutePath}
            />
          )}
          {tab === "graph" && (
            <NetworkGraph
              graphData={graphData}
              routePath={routePath}
              from={from}
              to={to}
              onNodeClick={(town) => {
                if (!from) setFrom(town);
                else if (!to) setTo(town);
                else setFrom(town);
                setTab("routes");
              }}
            />
          )}
          {tab === "editor" && (
            <NetworkEditor
              towns={towns}
              onChangeApplied={() => { loadGraph(); fetchTowns().then(setTowns); }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
