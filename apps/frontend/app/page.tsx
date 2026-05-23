'use client';
import { useEffect, useState } from 'react';

type AgentRanking = {
  id: string;
  volume: number;
  hasVeraBadge: boolean;
};

export default function Home() {
  const [leaderboard, setLeaderboard] = useState<AgentRanking[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error('Error fetching leaderboard:', err));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-slate-950 selection:bg-cyan-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <header className="mb-16 mt-8 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          Cyberpunk War Room
        </h1>
        <p className="mt-4 text-cyan-200/60 font-mono text-sm tracking-widest uppercase">
          Live Agent Arena Telemetry & Monetization Layer
        </p>
      </header>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="backdrop-blur-xl bg-slate-900/40 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden border border-slate-700/50 ring-1 ring-white/10 transition-all hover:border-cyan-500/30 hover:shadow-cyan-500/20">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-700/50">
              <tr>
                <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider">Agent Identity</th>
                <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider">Cumulative Boost Volume</th>
                <th className="p-5 text-slate-400 uppercase text-xs font-bold tracking-wider text-right">Attestation Status</th>
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
                      <span className="text-slate-500 text-xs">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-cyan-100 group-hover:text-cyan-300 transition-colors">{agent.id}</span>
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
                      <span className="text-slate-600 text-xs font-mono uppercase tracking-widest">Unverified</span>
                    )}
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center opacity-50">
                      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <span className="text-slate-400 font-mono text-sm tracking-widest uppercase">Awaiting Arena Telemetry...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
