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
    <div className="space-y-4">
      {/* Active route */}
      <div className="card p-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">
          Route Configuration
        </p>
        <div className="flex flex-col gap-2 relative">
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/5">
            <div className="w-8 h-8 rounded-md bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            </div>
            <span className={`text-sm truncate font-semibold ${from ? "text-slate-100" : "text-slate-500 italic"}`}>
              {from || "Start town..."}
            </span>
          </div>
          
          <div className="absolute left-[23px] top-[36px] h-4 border-l-2 border-dashed border-[#1e2a3a]" />
          
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/5">
            <div className="w-8 h-8 rounded-md bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            </div>
            <span className={`text-sm truncate font-semibold ${to ? "text-slate-100" : "text-slate-500 italic"}`}>
              {to || "End town..."}
            </span>
          </div>
        </div>
      </div>

      {/* Network stats Dashboard */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3 flex flex-col justify-between h-20 bg-gradient-to-br from-[#0f172a]/80 to-[#020617]">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Towns</span>
          <span className="text-2xl font-bold text-white tracking-tight">{stats?.totalTowns ?? "—"}</span>
        </div>
        <div className="card p-3 flex flex-col justify-between h-20 bg-gradient-to-br from-[#0f172a]/80 to-[#020617]">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Roads</span>
          <span className="text-2xl font-bold text-white tracking-tight">{stats?.totalRoads ?? "—"}</span>
        </div>
      </div>

      {/* Most connected */}
      {stats?.mostConnectedTown && (
        <div className="card p-4 relative overflow-hidden group border-amber-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-amber-500/30 transition-all duration-700" />
          <p className="text-[10px] text-amber-500/80 uppercase tracking-widest font-bold mb-1">
            Most Connected Hub
          </p>
          <p className="text-xl text-amber-400 font-bold truncate">
            {stats.mostConnectedTown}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {stats.mostConnectedDegree} direct routes
            </span>
          </div>
        </div>
      )}

      {/* Cost model */}
      <div className="card p-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">
          Algorithmic Weights
        </p>
        <div className="space-y-2">
          <StatRow icon="⛽" label="Fuel Efficiency" value="8 km / L" />
          <StatRow icon="💵" label="Fuel Price" value="GHS 11.95 / L" />
          <StatRow icon="⏱️" label="Time Value" value="GHS 0.50 / min" />
        </div>
      </div>

      {/* Tips */}
      <div className="text-[10px] text-slate-500 space-y-1.5 px-2">
        <p>💡 <strong className="text-slate-400">Pro tip:</strong> You can drag nodes in the Network graph to organize the map physics.</p>
        <p>💡 Routes update instantly when parameters change.</p>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <div className="flex items-center gap-2 text-slate-400">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span className="font-semibold text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/5">{value}</span>
    </div>
  );
}
