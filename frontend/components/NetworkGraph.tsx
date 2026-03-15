"use client";

import { fetchTop3 } from "@/lib/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

// ── Types ────────────────────────────────────────────────────────────────────
type GraphEdge = {
  source: string;
  target: string;
  distanceKm: number;
  travelTimeMin: number;
};
type Props = {
  graphData: { edges: GraphEdge[] };
  routePath: string[]; // kept for compat
  from: string;
  to: string;
  onNodeClick: (town: string) => void;
};

type RouteLayer = {
  id: string;
  label: string;
  color: string;
  path: string[];
  enabled: boolean;
  distance: number;
  time: number;
  cost?: number;
};

type ApiTopRoute = {
  rank?: number;
  path?: string[];
  totalDistance?: number;
  totalTime?: number;
  totalCost?: number;
};

type NodeInfo = {
  id: string;
  degree: number;
  neighbors: Array<{ name: string; dist: number; time: number }>;
};

const TOP_ROUTE_COLORS = ["#f59e0b", "#f97316", "#ef4444"];

// ── Build edge key ────────────────────────────────────────────────────────────
const edgeKey = (a: string, b: string) => [a, b].sort().join("|||");

// ── Component ────────────────────────────────────────────────────────────────
export default function NetworkGraph({
  graphData,
  from,
  to,
  onNodeClick,
}: Props) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });

  // Graph data
  const { nodes, links, degreeMap, neighborMap } = useMemo(() => {
    const degreeMap: Record<string, number> = {};
    const neighborMap: Record<
      string,
      Array<{ name: string; dist: number; time: number }>
    > = {};
    for (const e of graphData.edges) {
      degreeMap[e.source] = (degreeMap[e.source] || 0) + 1;
      degreeMap[e.target] = (degreeMap[e.target] || 0) + 1;
      (neighborMap[e.source] ||= []).push({
        name: e.target,
        dist: e.distanceKm,
        time: e.travelTimeMin,
      });
      (neighborMap[e.target] ||= []).push({
        name: e.source,
        dist: e.distanceKm,
        time: e.travelTimeMin,
      });
    }
    const nodeSet = new Set<string>();
    for (const e of graphData.edges) {
      nodeSet.add(e.source);
      nodeSet.add(e.target);
    }
    const nodes = Array.from(nodeSet).map((id) => ({
      id,
      degree: degreeMap[id] || 1,
    }));
    const links = graphData.edges.map((e) => ({
      source: e.source,
      target: e.target,
      distanceKm: e.distanceKm,
      travelTimeMin: e.travelTimeMin,
    }));
    return { nodes, links, degreeMap, neighborMap };
  }, [graphData]);

  // Stable graphData reference to prevent ForceGraph2D from reheating physics on every state update
  const fgData = useMemo(() => ({ nodes, links }), [nodes, links]);

  // Route layers
  const [layers, setLayers] = useState<RouteLayer[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    if (!from || !to || from === to) {
      setLayers([]);
      return;
    }
    let cancelled = false;
    setLoadingRoutes(true);
    fetchTop3(from, to)
      .then((t) => {
        if (cancelled) return;
        const newLayers: RouteLayer[] = [];
        const topRoutes: ApiTopRoute[] = Array.isArray(t?.routes)
          ? t.routes
          : [];
        if (topRoutes.length > 0) {
          topRoutes.forEach((r, i) => {
            if (!Array.isArray(r.path) || r.path.length === 0) return;
            newLayers.push({
              id: `top3_${i + 1}`,
              label: `Top Route #${r.rank ?? i + 1}`,
              color:
                TOP_ROUTE_COLORS[i] ||
                TOP_ROUTE_COLORS[TOP_ROUTE_COLORS.length - 1],
              path: r.path,
              enabled: i === 0,
              distance: r.totalDistance ?? 0,
              time: r.totalTime ?? 0,
              cost: r.totalCost,
            });
          });
        }
        setLayers(newLayers);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingRoutes(false);
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  // Edge → active layers
  const activeEdgeMap = useMemo(() => {
    const map: Record<string, string[]> = {}; // edgeKey → [color, ...]
    for (const layer of layers) {
      if (!layer.enabled || !Array.isArray(layer.path) || layer.path.length < 2)
        continue;
      for (let i = 0; i < layer.path.length - 1; i++) {
        const k = edgeKey(layer.path[i], layer.path[i + 1]);
        (map[k] ||= []).push(layer.color);
      }
    }
    return map;
  }, [layers]);

  // All highlighted nodes
  const activeNodeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const layer of layers) {
      if (
        !layer.enabled ||
        !Array.isArray(layer.path) ||
        layer.path.length === 0
      )
        continue;
      layer.path.forEach((n, i) => {
        if (i === 0) map[n] = "#22c55e";
        else if (i === layer.path.length - 1) map[n] = "#ef4444";
        else
          map[n] =
            map[n] === "#22c55e" || map[n] === "#ef4444" ? map[n] : layer.color;
      });
    }
    return map;
  }, [layers]);

  // Start / End override
  const startNode = from;
  const endNode = to;

  // Hover state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<any | null>(null);

  // Set of neighbor IDs of the currently hovered node
  const hoveredNeighborSet = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    return new Set((neighborMap[hoveredNode] || []).map((n) => n.name));
  }, [hoveredNode, neighborMap]);

  // Map: neighborId → edge data (dist, time) from hovered node
  const hoveredNeighborEdgeMap = useMemo(() => {
    if (!hoveredNode)
      return {} as Record<string, { dist: number; time: number }>;
    const m: Record<string, { dist: number; time: number }> = {};
    for (const nb of neighborMap[hoveredNode] || [])
      m[nb.name] = { dist: nb.dist, time: nb.time };
    return m;
  }, [hoveredNode, neighborMap]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatch, setSearchMatch] = useState<string | null>(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      setDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // D3 force config
  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.d3Force("charge")?.strength(-120); // stronger repulsion for clearer layout
    fgRef.current
      .d3Force("link")
      ?.distance((l: any) => Math.min(l.distanceKm / 8, 60) + 20);
  }, [nodes]);

  // Search handler
  const doSearch = useCallback(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchMatch(null);
      return;
    }
    const match = nodes.find((n) => n.id.toLowerCase().includes(q));
    if (match && fgRef.current) {
      setSearchMatch(match.id);
      fgRef.current.centerAt(
        fgRef.current.getGraphBbox()?.x[0] ?? 0,
        fgRef.current.getGraphBbox()?.y[0] ?? 0,
        400,
      );
      // Zoom to node
      const node = fgRef.current.getGraphBbox();
      fgRef.current.zoomToFit(600, 80);
    }
  }, [searchQuery, nodes]);

  // Fly to route
  const flyToRoute = useCallback(() => {
    if (fgRef.current) fgRef.current.zoomToFit(600, 40);
  }, []);

  // Toggle layer
  const toggleLayer = (id: string) =>
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)),
    );

  const enableAll = () =>
    setLayers((prev) => prev.map((l) => ({ ...l, enabled: true })));
  const disableAll = () =>
    setLayers((prev) => prev.map((l) => ({ ...l, enabled: false })));

  // Canvas: node
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isStart = node.id === startNode;
      const isEnd = node.id === endNode;
      const isActive = activeNodeMap[node.id];
      const isHov = node.id === hoveredNode;
      const isNeighbor = hoveredNeighborSet.has(node.id);
      const isSearch = node.id === searchMatch;
      const hovering = hoveredNode !== null;

      // Dim everything that's not the hovered node or its neighbors
      const dimmed = hovering && !isHov && !isNeighbor && !isStart && !isEnd;

      const r =
        Math.max(3, Math.min(10, node.degree * 0.7)) *
        (isHov ? 1.5 : 1) *
        (isNeighbor ? 1.2 : 1) *
        (isSearch ? 1.6 : 1);

      ctx.globalAlpha = dimmed ? 0.12 : 1;

      // Outer glow
      if (isHov || isNeighbor || isSearch || isActive) {
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          r + (isHov ? 8 : isNeighbor ? 6 : isActive ? 5 : 4),
          0,
          2 * Math.PI,
        );
        ctx.fillStyle = isHov
          ? "rgba(248,250,252,0.25)"
          : isNeighbor
            ? "rgba(251,191,36,0.25)"
            : isSearch
              ? "rgba(245,158,11,0.25)"
              : isStart
                ? "rgba(34,197,94,0.25)"
                : isEnd
                  ? "rgba(239,68,68,0.25)"
                  : "rgba(148,163,184,0.15)";

        // Add native canvas glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isHov
        ? "#ffffff" // Brighter white on hover
        : isNeighbor
          ? "#f59e0b"
          : isStart
            ? "#22c55e"
            : isEnd
              ? "#ef4444"
              : isSearch
                ? "#f59e0b"
                : isActive
                  ? activeNodeMap[node.id]
                  : "#1e293b"; // Darker slate base
      ctx.fill();

      // Border
      ctx.strokeStyle = isHov
        ? "#ffffff"
        : isNeighbor
          ? "#fbbf24"
          : isStart
            ? "#4ade80" // Lighter green border
            : isEnd
              ? "#f87171" // Lighter red border
              : isSearch
                ? "#fbbf24"
                : isActive
                  ? activeNodeMap[node.id]
                  : "#334155"; // Deeper slate border
      ctx.lineWidth = isHov || isNeighbor ? 2 : isActive ? 1.5 : 0.8;
      ctx.stroke();

      // Label
      const showLabel =
        isHov ||
        isNeighbor ||
        isActive ||
        isStart ||
        isEnd ||
        isSearch ||
        globalScale > 3;
      if (showLabel) {
        const fontSize = Math.max(5, 11 / globalScale);
        ctx.font = `${isHov || isNeighbor || isStart || isEnd ? "bold " : ""}${fontSize}px Inter,sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        const labelY = node.y + r + 3;
        const labelX = node.x;
        const labelText = node.id;

        // Hovered + neighbor both render in amber — exactly the same style
        ctx.fillStyle =
          isHov || isNeighbor
            ? "#fbbf24"
            : isStart
              ? "#86efac"
              : isEnd
                ? "#fca5a5"
                : isActive
                  ? activeNodeMap[node.id]
                  : "#94a3b8";
        ctx.fillText(labelText, labelX, labelY);
      }

      ctx.globalAlpha = 1;
    },
    [
      startNode,
      endNode,
      activeNodeMap,
      hoveredNode,
      hoveredNeighborSet,
      searchMatch,
    ],
  );

  // Canvas: link
  const paintLink = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const srcId =
        typeof link.source === "object" ? link.source.id : link.source;
      const tgtId =
        typeof link.target === "object" ? link.target.id : link.target;
      const k = edgeKey(srcId, tgtId);
      const colors = activeEdgeMap[k];

      const sx = typeof link.source === "object" ? link.source.x : 0;
      const sy = typeof link.source === "object" ? link.source.y : 0;
      const tx = typeof link.target === "object" ? link.target.x : 0;
      const ty = typeof link.target === "object" ? link.target.y : 0;

      // Is this edge connected to the hovered node?
      const isNeighborEdge =
        hoveredNode !== null &&
        (srcId === hoveredNode || tgtId === hoveredNode) &&
        (hoveredNeighborSet.has(srcId) || hoveredNeighborSet.has(tgtId));

      const hovering = hoveredNode !== null;

      if (!colors?.length && !isNeighborEdge) {
        // Default edge — dim when hovering elsewhere
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = hovering ? 0.08 : 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
        return;
      }

      const dx = tx - sx,
        dy = ty - sy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len,
        ny = dx / len; // perpendicular normal
      const mx = (sx + tx) / 2,
        my = (sy + ty) / 2;

      // Neighbor edge — draw bright white line with label on canvas
      if (isNeighborEdge && !colors?.length) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.9;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#e2e8f0";
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Draw distance + time label at midpoint
        const edgeInfo =
          hoveredNeighborEdgeMap[srcId === hoveredNode ? tgtId : srcId];
        if (edgeInfo) {
          const label = `${edgeInfo.dist}km · ${edgeInfo.time}min`;
          const fontSize = Math.max(5, 9 / globalScale);
          ctx.font = `bold ${fontSize}px Inter,sans-serif`;
          const tw = ctx.measureText(label).width;

          // Background pill
          ctx.fillStyle = "rgba(8,12,20,0.85)";
          ctx.beginPath();
          ctx.roundRect?.(
            mx - tw / 2 - 3,
            my - fontSize / 2 - 2,
            tw + 6,
            fontSize + 4,
            3,
          );
          ctx.fill();

          // Text
          ctx.fillStyle = "#fbbf24";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, mx, my);
        }
        return;
      }

      // Route-colored edges — parallel offset lines
      if (colors?.length) {
        const count = colors.length;
        const spread = 1.8;
        ctx.globalAlpha = hovering && !isNeighborEdge ? 0.3 : 0.85;
        colors.forEach((color, ci) => {
          const offset = (ci - (count - 1) / 2) * spread;
          ctx.beginPath();
          ctx.moveTo(sx + nx * offset, sy + ny * offset);
          ctx.lineTo(tx + nx * offset, ty + ny * offset);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1;
      }
    },
    [activeEdgeMap, hoveredNode, hoveredNeighborSet, hoveredNeighborEdgeMap],
  );

  // Particles: only on active edges
  const particleColor = useCallback(
    (link: any) => {
      const srcId =
        typeof link.source === "object" ? link.source.id : link.source;
      const tgtId =
        typeof link.target === "object" ? link.target.id : link.target;
      const colors = activeEdgeMap[edgeKey(srcId, tgtId)];
      return colors?.[0] ?? "transparent";
    },
    [activeEdgeMap],
  );

  const particleCount = useCallback(
    (link: any) => {
      const srcId =
        typeof link.source === "object" ? link.source.id : link.source;
      const tgtId =
        typeof link.target === "object" ? link.target.id : link.target;
      return activeEdgeMap[edgeKey(srcId, tgtId)]?.length ? 2 : 0;
    },
    [activeEdgeMap],
  );

  // Selected item for detail panel
  const [selectedItem, setSelectedItem] = useState<
    | {
        type: "node";
        id: string;
        degree: number;
        neighbors: Array<{ name: string; dist: number; time: number }>;
      }
    | { type: "link"; src: string; tgt: string; dist: number; time: number }
    | null
  >(null);

  // Handle node click — push up to page.tsx to select it in the Route Sidepanel
  const handleNodeClick = useCallback(
    (node: any) => {
      const nb = neighborMap[node.id] || [];
      const sorted = [...nb].sort((a, b) => a.dist - b.dist);
      setSelectedItem({
        type: "node",
        id: node.id,
        degree: degreeMap[node.id] || 0,
        neighbors: sorted,
      });
      onNodeClick(node.id);
    },
    [neighborMap, degreeMap, onNodeClick],
  );

  // Handle link click — open detail panel
  const handleLinkClick = useCallback((link: any) => {
    const src = typeof link.source === "object" ? link.source.id : link.source;
    const tgt = typeof link.target === "object" ? link.target.id : link.target;
    setSelectedItem({
      type: "link",
      src,
      tgt,
      dist: link.distanceKm,
      time: link.travelTimeMin,
    });
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative flex flex-col"
      style={{ height: "calc(100vh - 56px)" }}
    >
      {/* ── Toolbar ── */}
      <div className="bg-[#0a0d15] border-b border-[#1a2332] px-4 py-2 flex items-center gap-3 flex-wrap z-20">
        {/* Search */}
        <div className="flex gap-1.5 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search town…"
            className="px-3 py-1.5 text-xs rounded-lg bg-[#111827] border border-[#1e2a3a] text-slate-200
                       placeholder-slate-500 focus:outline-none focus:border-[#2d3f55] w-44"
          />
          <button
            onClick={doSearch}
            className="px-3 py-1.5 text-xs rounded-lg bg-[#111827] border border-[#1e2a3a] text-slate-300 hover:text-slate-100 transition-colors"
          >
            Find
          </button>
          {searchMatch && (
            <button
              onClick={() => {
                setSearchMatch(null);
                setSearchQuery("");
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="w-px h-4 bg-[#1a2332]" />

        {/* Zoom controls */}
        <div className="flex gap-1">
          {[
            {
              label: "＋",
              tip: "Zoom in",
              fn: () => fgRef.current?.zoom(fgRef.current.zoom() * 1.4, 300),
            },
            {
              label: "－",
              tip: "Zoom out",
              fn: () => fgRef.current?.zoom(fgRef.current.zoom() / 1.4, 300),
            },
            { label: "⊞", tip: "Fit graph", fn: flyToRoute },
            {
              label: "⟳",
              tip: "Reset",
              fn: () => {
                fgRef.current?.centerAt(0, 0, 400);
                fgRef.current?.zoom(1, 400);
              },
            },
          ].map(({ label, tip, fn }) => (
            <button
              key={tip}
              onClick={fn}
              title={tip}
              className="w-7 h-7 text-sm rounded bg-[#111827] border border-[#1e2a3a] text-slate-300
                         hover:text-slate-100 transition-colors flex items-center justify-center"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-[#1a2332]" />

        {/* Fly to route */}
        {layers.length > 0 && (
          <button
            onClick={flyToRoute}
            className="px-3 py-1.5 text-xs rounded-lg bg-[#111827] border border-[#1e2a3a] text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            ⊹ Fly to route
          </button>
        )}

        {/* Graph info */}
        <span className="ml-auto text-[10px] text-slate-300">
          {nodes.length} nodes · {links.length} edges
          {loadingRoutes && (
            <span className="ml-2 text-amber-500 animate-pulse">
              Loading routes…
            </span>
          )}
        </span>
      </div>

      {/* ── Canvas + panels ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Force Graph */}
        <ForceGraph2D
          ref={fgRef}
          graphData={fgData}
          width={dims.w}
          height={dims.h - 44}
          backgroundColor="#07090f"
          nodeCanvasObject={paintNode}
          nodeCanvasObjectMode={() => "replace"}
          linkCanvasObject={paintLink}
          linkCanvasObjectMode={() => "replace"}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          onNodeHover={(node: any) => setHoveredNode(node ? node.id : null)}
          onLinkHover={(link: any) => setHoveredLink(link)}
          linkDirectionalArrowLength={(link: any) => {
            const srcId =
              typeof link.source === "object" ? link.source.id : link.source;
            const tgtId =
              typeof link.target === "object" ? link.target.id : link.target;
            const hasColor = activeEdgeMap[edgeKey(srcId, tgtId)]?.length;
            return hasColor ? 4 : 0; // Show slightly enlarged arrow on active links
          }}
          linkDirectionalArrowColor={particleColor}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={particleCount}
          linkDirectionalParticleColor={particleColor}
          linkDirectionalParticleWidth={2.5}
          linkDirectionalParticleSpeed={0.005}
          cooldownTicks={150}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />

        {/* ── Route Layers Panel (top-left) ── */}
        {(layers.length > 0 || (from && to)) && (
          <div className="absolute top-3 left-3 bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 space-y-2 max-w-[220px] z-10">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Layers
              </p>
              <div className="flex gap-1">
                <button
                  onClick={enableAll}
                  className="text-[9px] text-slate-300 hover:text-slate-100 transition-colors"
                >
                  ALL
                </button>
                <span className="text-[#1e2a3a]">·</span>
                <button
                  onClick={disableAll}
                  className="text-[9px] text-slate-300 hover:text-slate-100 transition-colors"
                >
                  NONE
                </button>
              </div>
            </div>

            {loadingRoutes ? (
              <div className="space-y-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 shimmer rounded" />
                ))}
              </div>
            ) : layers.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">
                {from && to ? "No routes found" : "Select from & to towns"}
              </p>
            ) : (
              <div className="space-y-1">
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left ${
                      layer.enabled
                        ? "bg-[#111827] border border-[#1e2a3a]"
                        : "opacity-65 hover:opacity-90"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: layer.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-300 font-medium truncate">
                        {layer.label}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {layer.distance}km · {layer.time}min
                        {layer.cost ? ` · GHS${layer.cost.toFixed(0)}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold ${layer.enabled ? "text-slate-300" : "text-slate-500"}`}
                    >
                      {layer.enabled ? "ON" : "OFF"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Route summary */}
            {layers.length > 0 && (
              <div className="border-t border-[#1a2332] pt-2 text-[9px] text-slate-300 space-y-0.5">
                <p className="font-semibold text-slate-100">
                  {from} → {to}
                </p>
                <p>
                  {layers.filter((l) => l.enabled).length} of {layers.length}{" "}
                  routes shown
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Hover tooltip (link) ── */}
        {hoveredLink &&
          (() => {
            const srcId =
              typeof hoveredLink.source === "object"
                ? hoveredLink.source.id
                : hoveredLink.source;
            const tgtId =
              typeof hoveredLink.target === "object"
                ? hoveredLink.target.id
                : hoveredLink.target;
            return (
              <div className="absolute top-3 right-3 bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 text-xs z-10">
                <p className="font-semibold text-slate-200">
                  {srcId} ↔ {tgtId}
                </p>
                <p className="text-slate-300 text-[10px] mt-0.5">
                  {hoveredLink.distanceKm} km · {hoveredLink.travelTimeMin} min
                </p>
              </div>
            );
          })()}

        {/* ── Legend (bottom-right) ── */}
        <div className="absolute bottom-3 right-3 bg-[#0d1117] border border-[#1a2332] rounded-xl p-3 text-[10px] z-10 space-y-1">
          <p className="text-slate-400 uppercase tracking-wider font-semibold text-[9px] mb-1.5">
            Legend
          </p>
          {[
            { color: "#22c55e", label: "Start town" },
            { color: "#ef4444", label: "End town" },
            { color: "#334155", label: "Other towns" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: color }}
              />
              <span className="text-slate-300">{label}</span>
            </div>
          ))}
          <div className="border-t border-[#1a2332] mt-1.5 pt-1.5 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1.5 rounded flex-shrink-0 bg-amber-500" />
              <span className="text-slate-300">Top Route #1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1.5 rounded flex-shrink-0 bg-orange-500" />
              <span className="text-slate-300">Top Route #2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-1.5 rounded flex-shrink-0 bg-red-500" />
              <span className="text-slate-300">Top Route #3</span>
            </div>
          </div>
          <div className="border-t border-[#1a2332] mt-1.5 pt-1.5 text-[9px] text-slate-400 space-y-0.5">
            <p>Drag nodes · Scroll to zoom</p>
            <p>Click node to inspect</p>
          </div>
        </div>
        {/* ── Detail Panel (slide in from right) ── */}
        {/* Backdrop */}
        {selectedItem && (
          <div
            className="absolute inset-0 z-30"
            onClick={() => setSelectedItem(null)}
          />
        )}
        {/* Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-56 bg-[#0d1117] border-l border-[#1a2332] z-40 flex flex-col
                      transition-transform duration-300 ease-in-out
                      ${selectedItem ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedItem && (
            <>
              {/* Panel header */}
              <div className="flex items-start justify-between p-4 border-b border-[#1a2332]">
                <div className="min-w-0 pr-2">
                  {selectedItem.type === "node" ? (
                    <>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Town
                      </p>
                      <p className="text-sm font-bold text-slate-100 truncate mt-0.5">
                        {selectedItem.id}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Road
                      </p>
                      <p className="text-xs font-bold text-slate-100 truncate mt-0.5">
                        {selectedItem.src}
                      </p>
                      <p className="text-[10px] text-slate-400">↕</p>
                      <p className="text-xs font-bold text-slate-100 truncate">
                        {selectedItem.tgt}
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-6 h-6 rounded-md bg-[#111827] border border-[#1e2a3a] text-slate-300
                               hover:text-slate-100 flex items-center justify-center
                               text-xs flex-shrink-0 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {selectedItem.type === "node" ? (
                  <>
                    {/* Stats */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Stats
                      </p>
                      <StatRow
                        label="Direct roads"
                        value={selectedItem.degree}
                      />
                      <StatRow
                        label="Route role"
                        value={
                          selectedItem.id === from
                            ? "Start town"
                            : selectedItem.id === to
                              ? "End town"
                              : activeNodeMap[selectedItem.id]
                                ? "On route"
                                : "None"
                        }
                      />
                    </div>
                    {/* Neighbors list */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Connected
                      </p>
                      {selectedItem.neighbors.map((nb) => {
                        const fuelCost = ((nb.dist / 8) * 11.95).toFixed(2);
                        return (
                          <div
                            key={nb.name}
                            className="bg-[#111827] border border-[#1a2332] rounded-lg p-2 space-y-0.5"
                          >
                            <p className="font-semibold text-slate-200 truncate">
                              {nb.name}
                            </p>
                            <div className="flex gap-2 text-[10px] text-slate-400">
                              <span>{nb.dist} km</span>
                              <span>·</span>
                              <span>{nb.time} min</span>
                              <span>·</span>
                              <span>GHS {fuelCost}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Road stats */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Details
                      </p>
                      <StatRow
                        label="Distance"
                        value={`${selectedItem.dist} km`}
                      />
                      <StatRow
                        label="Travel time"
                        value={`${selectedItem.time} min`}
                      />
                      <StatRow
                        label="Fuel cost"
                        value={`GHS ${((selectedItem.dist / 8) * 11.95).toFixed(2)}`}
                      />
                      <StatRow
                        label="Time cost"
                        value={`GHS ${(selectedItem.time * 0.5).toFixed(2)}`}
                      />
                      <StatRow
                        label="Total cost"
                        value={`GHS ${((selectedItem.dist / 8) * 11.95 + selectedItem.time * 0.5).toFixed(2)}`}
                      />
                    </div>
                    {/* Endpoints */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Endpoints
                      </p>
                      <div className="bg-[#111827] border border-[#1a2332] rounded-lg p-2.5 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                          <span className="text-slate-300 truncate">
                            {selectedItem.src}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {degreeMap[selectedItem.src] || 0} rds
                          </span>
                        </div>
                        <div className="border-l border-dashed border-[#1e2a3a] ml-[7px] h-2" />
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                          <span className="text-slate-300 truncate">
                            {selectedItem.tgt}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {degreeMap[selectedItem.tgt] || 0} rds
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      ⛽ 8km/L · GHS 11.95/L · ⏱ GHS 0.50/min
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center bg-[#111827] border border-[#1a2332] rounded-lg px-2.5 py-1.5">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-100 text-right">{value}</span>
    </div>
  );
}
