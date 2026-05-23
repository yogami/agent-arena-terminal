'use client';
import { useEffect, useState } from 'react';

type AgentRanking = {
  id: string;
  volume: number;
  hasVeraBadge: boolean;
};

type TrapSummary = {
  trapId: string;
  trapType: 'api_key' | 'pii' | 'document';
  description: string;
  status: 'active' | 'triggered';
  createdAt: string;
  triggeredAt?: string;
  triggeredBy?: string;
};

type Violation = {
  trapId: string;
  agentId: string;
  accessContext: string;
  timestamp: string;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
};

const severityColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  low: 'text-green-400 bg-green-400/10 border-green-400/30',
};

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<AgentRanking[]>([]);
  const [traps, setTraps] = useState<TrapSummary[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error('Error fetching leaderboard:', err));

    fetch('/api/traps')
      .then((res) => res.json())
      .then((data) => setTraps(data))
      .catch((err) => console.error('Error fetching traps:', err));

    fetch('/api/traps/violations')
      .then((res) => res.json())
      .then((data) => setViolations(data))
      .catch((err) => console.error('Error fetching violations:', err));
  }, []);

  const activeTraps = traps.filter((t) => t.status === 'active').length;
  const triggeredTraps = traps.filter((t) => t.status === 'triggered').length;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-slate-950 selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <header className="mb-16 mt-8 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          Cyberpunk War Room
        </h1>
        <p className="mt-4 text-cyan-200/60 font-mono text-sm tracking-widest uppercase">
          Live Agent Arena Telemetry &amp; Monetization Layer
        </p>
      </header>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Leaderboard Section */}
        <div className="backdrop-blur-xl bg-slate-900/40 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden border border-slate-700/50 ring-1 ring-white/10 transition-all hover:border-cyan-500/30 hover:shadow-cyan-500/20">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-700/50">
              <tr>
                <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider">
                  Agent Identity
                </th>
                <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider">
                  Cumulative Boost Volume
                </th>
                <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider text-right">
                  Attestation Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {leaderboard.map((agent, idx) => (
                <tr
                  key={agent.id}
                  data-testid={`agent-row-${agent.id}`}
                  className="group hover:bg-slate-800/40 transition-colors duration-200"
                >
                  <td className="p-5 font-mono text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-cyan-100 group-hover:text-cyan-300 transition-colors">
                        {agent.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 font-mono">
                    <span className="text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-md border border-emerald-400/20">
                      ${agent.volume.toFixed(2)} USDC
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {agent.hasVeraBadge ? (
                      <span
                        data-testid="vera-badge"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 shadow-[0_0_5px_#60a5fa]"></span>
                        Hardware-Attested
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs font-mono uppercase tracking-widest">
                        Unverified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center opacity-50">
                      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <span className="text-slate-400 font-mono text-sm tracking-widest uppercase">
                        Awaiting Arena Telemetry...
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Agent Traps Compliance Dashboard */}
        <section data-testid="traps-dashboard" className="mt-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] mb-8">
            Agent Traps — EU AI Act Compliance
          </h2>

          {/* Stats Cards */}
          <div data-testid="traps-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div
              data-testid="stat-active-traps"
              className="backdrop-blur-xl bg-slate-900/40 rounded-xl p-6 border border-slate-700/50 ring-1 ring-white/10 hover:border-cyan-500/30 transition-all"
            >
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-2 font-mono">
                Active Traps
              </p>
              <p className="text-4xl font-extrabold text-cyan-400 font-mono">{activeTraps}</p>
            </div>
            <div
              data-testid="stat-triggered-traps"
              className="backdrop-blur-xl bg-slate-900/40 rounded-xl p-6 border border-slate-700/50 ring-1 ring-white/10 hover:border-orange-500/30 transition-all"
            >
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-2 font-mono">
                Triggered Traps
              </p>
              <p className="text-4xl font-extrabold text-orange-400 font-mono">{triggeredTraps}</p>
            </div>
            <div
              data-testid="stat-total-violations"
              className="backdrop-blur-xl bg-slate-900/40 rounded-xl p-6 border border-slate-700/50 ring-1 ring-white/10 hover:border-red-500/30 transition-all"
            >
              <p className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-2 font-mono">
                Total Violations
              </p>
              <p className="text-4xl font-extrabold text-red-400 font-mono">{violations.length}</p>
            </div>
          </div>

          {/* Violations Table */}
          <div className="backdrop-blur-xl bg-slate-900/40 rounded-2xl shadow-2xl shadow-red-900/20 overflow-hidden border border-slate-700/50 ring-1 ring-white/10 transition-all hover:border-red-500/30 hover:shadow-red-500/20">
            <table data-testid="violations-table" className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 border-b border-slate-700/50">
                <tr>
                  <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider">
                    Trap ID
                  </th>
                  <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider">
                    Agent ID
                  </th>
                  <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider">
                    Severity
                  </th>
                  <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider text-right">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {violations.map((v, idx) => (
                  <tr
                    key={`${v.trapId}-${v.agentId}-${idx}`}
                    data-testid={`violation-row-${v.trapId}`}
                    className="group hover:bg-slate-800/40 transition-colors duration-200"
                  >
                    <td className="p-5 font-mono text-sm text-cyan-100">{v.trapId}</td>
                    <td className="p-5 font-mono text-sm text-cyan-100">{v.agentId}</td>
                    <td className="p-5">
                      <span
                        data-testid={`severity-${v.severityLevel}`}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${severityColors[v.severityLevel] || severityColors.low}`}
                      >
                        {v.severityLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 font-mono text-sm text-slate-400 text-right">
                      {new Date(v.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {violations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-16 text-center">
                      <div className="inline-flex flex-col items-center justify-center opacity-50">
                        <span className="text-2xl mb-4">🛡️</span>
                        <span className="text-slate-400 font-mono text-sm tracking-widest uppercase">
                          No Violations Detected — All Clear
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
