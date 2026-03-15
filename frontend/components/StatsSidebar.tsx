"use client";

type Stats = {
  totalTowns: number;
  totalRoads: number;
  mostConnectedTown: string;
  mostConnectedDegree: number;
  averageDegree: number;
} | null;

type Props = { stats: Stats; from: string; to: string };

export default function StatsSidebar({ stats, from, to }: Props) {
  return (
    <div className="space-y-5 text-xs">

      {/* Active route */}
      {(from || to) && (
        <div className="space-y-1">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Active Route</p>
          <div className="glass-lighter rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-slate-300 truncate">{from || <span className="text-slate-600 italic">not set</span>}</span>
            </div>
            <div className="border-l border-dashed border-slate-700 ml-[5px] h-3" />
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-slate-300 truncate">{to || <span className="text-slate-600 italic">not set</span>}</span>
            </div>
          </div>
        </div>
      )}

      {/* Network stats */}
      <div className="space-y-1">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Network</p>
        <div className="space-y-1.5">
          <StatRow label="Towns" value={stats?.totalTowns ?? "—"} />
          <StatRow label="Roads" value={stats?.totalRoads ?? "—"} />
          <StatRow label="Avg degree" value={stats?.averageDegree ?? "—"} />
        </div>
      </div>

      {/* Most connected */}
      {stats?.mostConnectedTown && (
        <div className="space-y-1">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Most Connected</p>
          <div className="glass-lighter rounded-lg p-3">
            <p className="text-amber-400 font-semibold truncate">{stats.mostConnectedTown}</p>
            <p className="text-slate-500">{stats.mostConnectedDegree} direct roads</p>
          </div>
        </div>
      )}

      {/* Cost model */}
      <div className="space-y-1">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Cost Model</p>
        <div className="glass-lighter rounded-lg p-3 space-y-1 text-slate-400">
          <p>⛽ 8 km / litre</p>
          <p>💰 GHS 11.95 / L</p>
          <p>⏱ GHS 0.50 / min</p>
        </div>
      </div>

      {/* Guide */}
      <div className="space-y-1">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">How to use</p>
        <ol className="space-y-1 text-slate-500 list-none">
          <li><span className="text-slate-600">①</span> Pick Start & End in header</li>
          <li><span className="text-slate-600">②</span> Routes auto-load below</li>
          <li><span className="text-slate-600">③</span> Switch tabs for more options</li>
          <li><span className="text-slate-600">④</span> Click nodes in Network Map</li>
        </ol>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center glass-lighter rounded px-2.5 py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-200">{value}</span>
    </div>
  );
}
