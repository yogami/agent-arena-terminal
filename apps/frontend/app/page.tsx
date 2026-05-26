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
  critical: 'text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_10px_rgba(248,113,113,0.2)]',
  high: 'text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]',
  low: 'text-green-400 bg-green-400/10 border-green-400/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]',
};

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<AgentRanking[]>([]);
  const [traps, setTraps] = useState<TrapSummary[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [tickerLogs, setTickerLogs] = useState<string[]>([]);

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

    // Simulated Live Telemetry Feed
    const interval = setInterval(() => {
      const actions = ['Intercepted A2A packet', 'Verifying x402 signature', 'Trap heartbeat sync', 'Scanning orchestration layer'];
      const agents = ['Agent-0x4f', 'Oracle-Node', 'Swarm-Alpha', 'Nexus-9'];
      const log = `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${actions[Math.floor(Math.random() * actions.length)]} from ${agents[Math.floor(Math.random() * agents.length)]}...`;
      setTickerLogs(prev => [log, ...prev].slice(0, 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeTraps = traps.filter((t) => t.status === 'active').length;
  const triggeredTraps = traps.filter((t) => t.status === 'triggered').length;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 relative overflow-hidden font-sans">
      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
      
      {/* Cyberpunk Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <header className="mb-12 mt-4 relative z-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
          <span className="text-cyan-300 text-xs font-mono uppercase tracking-widest">A2A Network Online</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-600 drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
          Agent Arena Terminal
        </h1>
        <p className="mt-4 text-slate-400 font-mono text-sm tracking-widest uppercase">
          Open Source Observability Protocol
        </p>
      </header>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Leaderboard */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-widest uppercase text-cyan-400 font-mono flex items-center gap-2">
                <span className="text-2xl">⚡</span> Live Leaderboard
              </h2>
            </div>
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden border border-slate-700/50 ring-1 ring-white/5 transition-all hover:border-cyan-500/40">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/80 border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-slate-500 uppercase text-xs font-bold tracking-widest">Agent Identity</th>
                    <th className="p-4 text-slate-500 uppercase text-xs font-bold tracking-widest">Cumulative Volume</th>
                    <th className="p-4 text-slate-500 uppercase text-xs font-bold tracking-widest text-right">Attestation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.map((agent, idx) => (
                    <tr key={agent.id} className="group hover:bg-slate-800/50 transition-colors duration-300">
                      <td className="p-4 font-mono text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-600 text-xs">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="text-cyan-200 group-hover:text-cyan-400 transition-colors">{agent.id}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <span className="text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded border border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                          ${agent.volume.toFixed(2)} USDC
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {agent.hasVeraBadge ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 shadow-[0_0_5px_#60a5fa] animate-pulse"></span>
                            Hardware-Attested
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs font-mono uppercase tracking-widest">Unverified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center">
                        <div className="inline-flex flex-col items-center justify-center opacity-40">
                          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <span className="text-slate-400 font-mono text-xs tracking-widest uppercase">Awaiting A2A Telemetry...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Violations */}
          <section>
            <h2 className="text-xl font-bold tracking-widest uppercase text-red-400 font-mono flex items-center gap-2 mb-4 mt-8">
              <span className="text-2xl">🚨</span> Security Incidents
            </h2>
            <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl shadow-2xl shadow-red-900/10 overflow-hidden border border-slate-700/50 ring-1 ring-white/5 transition-all hover:border-red-500/30">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/80 border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-slate-500 uppercase text-xs font-bold tracking-widest">Trap ID</th>
                    <th className="p-4 text-slate-500 uppercase text-xs font-bold tracking-widest">Rogue Agent ID</th>
                    <th className="p-4 text-slate-500 uppercase text-xs font-bold tracking-widest">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {violations.map((v, idx) => (
                    <tr key={`${v.trapId}-${idx}`} className="group hover:bg-slate-800/50 transition-colors duration-300">
                      <td className="p-4 font-mono text-sm text-slate-300">{v.trapId}</td>
                      <td className="p-4 font-mono text-sm text-red-300">{v.agentId}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded text-[10px] uppercase font-bold border ${severityColors[v.severityLevel] || severityColors.low}`}>
                          {v.severityLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {violations.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                        Zero Incidents Detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Radar & Ticker */}
        <div className="space-y-8">
          {/* Radar Stats */}
          <div className="backdrop-blur-xl bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 ring-1 ring-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-6 font-mono border-b border-slate-800 pb-2">Trap Network Status</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-mono text-sm">Active Nodes</span>
                <span className="text-2xl font-bold text-cyan-400 font-mono drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{activeTraps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-mono text-sm">Compromised</span>
                <span className="text-2xl font-bold text-orange-400 font-mono drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">{triggeredTraps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-mono text-sm">Total Violations</span>
                <span className="text-2xl font-bold text-red-400 font-mono drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]">{violations.length}</span>
              </div>
            </div>
            
            {/* Fake Radar sweep */}
            <div className="mt-8 relative h-32 w-full rounded-xl bg-slate-950/50 border border-slate-800 overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]"></div>
               <div className="w-full h-[1px] bg-cyan-500/20 absolute top-1/2"></div>
               <div className="h-full w-[1px] bg-cyan-500/20 absolute left-1/2"></div>
               {/* Radar sweeping line */}
               <div className="absolute top-1/2 left-1/2 w-16 h-16 origin-top-left bg-gradient-to-br from-cyan-500/40 to-transparent animate-[spin_3s_linear_infinite] rounded-tl-full" style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}}></div>
               <span className="relative z-10 text-cyan-500/50 font-mono text-[10px] tracking-widest uppercase">Scanning Network</span>
            </div>
          </div>

          {/* Live Telemetry Ticker */}
          <div className="backdrop-blur-xl bg-slate-950/80 rounded-2xl p-6 border border-slate-800 ring-1 ring-white/5">
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-4 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Raw Telemetry
            </h3>
            <div className="h-48 overflow-hidden relative">
              <div className="absolute top-0 w-full h-4 bg-gradient-to-b from-slate-950/80 to-transparent z-10"></div>
              <div className="absolute bottom-0 w-full h-4 bg-gradient-to-t from-slate-950/80 to-transparent z-10"></div>
              <div className="space-y-2 font-mono text-[10px] text-slate-500">
                {tickerLogs.map((log, i) => (
                  <div key={i} className={`truncate ${i === 0 ? 'text-green-400' : ''}`}>
                    {log}
                  </div>
                ))}
                {tickerLogs.length === 0 && <div>Awaiting stream...</div>}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
