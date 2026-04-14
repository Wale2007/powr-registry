"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";

interface Leader {
  github_username: string | null;
  wallet_address: string | null;
  farmer_xp: number;
  reputation_points: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("github_username, wallet_address, farmer_xp, reputation_points")
        .order("farmer_xp", { ascending: false })
        .limit(10);
      if (!error && data) setLeaders(data);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  const getRankBadge = (i: number) => {
    if (i === 0) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFD700] text-black font-black text-sm">1</div>;
    if (i === 1) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#C0C0C0] text-black font-black text-sm">2</div>;
    if (i === 2) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#CD7F32] text-white font-black text-sm">3</div>;
    return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white/50 font-bold text-sm">{i+1}</div>;
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10 text-center animate-reveal">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
            Global <span className="gradient-text">Rankings</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Real-time reputation standing. The truest builders rise to the top.
          </p>
        </div>

        {/* ─── Top 3 Podium (Desktop) ─── */}
        {!loading && leaders.length >= 3 && (
          <div className="hidden sm:grid grid-cols-3 gap-6 mb-12 animate-reveal stagger-1 items-end">
            {[1, 0, 2].map((idx) => {
              const p = leaders[idx];
              const isFirst = idx === 0;
              return (
                <div
                  key={idx}
                  className={`card rounded-2xl p-6 text-center shadow-lg relative ${isFirst ? "z-10" : ""}`}
                  style={{
                    height: isFirst ? "280px" : "240px",
                    background: isFirst ? "linear-gradient(180deg, rgba(109,129,150,0.15) 0%, rgba(109,129,150,0.05) 100%)" : "var(--color-bg-card)",
                    border: isFirst ? "1px solid var(--color-primary)" : "1px solid var(--color-border)",
                    transform: isFirst ? "translateY(-16px)" : "none",
                  }}
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 shadow-xl rounded-full">
                    {getRankBadge(idx)}
                  </div>
                  <div className="pt-6">
                    <p className="font-bold text-white text-lg truncate mb-1">
                      {p.github_username || "Pioneer"}
                    </p>
                    <p className="text-xs font-mono truncate px-2 py-1 bg-black/20 rounded mx-auto inline-block mb-6" style={{ color: "var(--color-text-muted)" }}>
                      {p.wallet_address ? `${p.wallet_address.slice(0, 8)}...${p.wallet_address.slice(-4)}` : "No wallet linked"}
                    </p>
                    
                    <div className="flex gap-4 justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold" style={{ color: "var(--color-success)" }}>{p.farmer_xp || 0}</p>
                        <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Farmer XP</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <p className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>{p.reputation_points || 0}</p>
                        <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Rep</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Table ─── */}
        <div className="card-static overflow-hidden animate-reveal stagger-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(0,0,0,0.2)" }}>
                <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Rank</th>
                <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Pioneer Identity</th>
                <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Farmer XP</th>
                <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-right" style={{ color: "var(--color-text-muted)" }}>Reputation</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((p, index) => (
                <tr key={index} className="table-row border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="p-4 sm:p-5 font-bold" style={{ width: "60px" }}>
                    {getRankBadge(index)}
                  </td>
                  <td className="p-4 sm:p-5">
                    <p className="font-bold text-white">{p.github_username || "Anonymous Scout"}</p>
                    <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {p.wallet_address ? `${p.wallet_address.substring(0, 10)}...${p.wallet_address.slice(-4)}` : "No wallet"}
                    </p>
                  </td>
                  <td className="p-4 sm:p-5">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(109,129,150,0.1)", color: "var(--color-success)" }}>
                      {p.farmer_xp || 0} XP
                    </span>
                  </td>
                  <td className="p-4 sm:p-5 text-right">
                    <span className="font-bold text-lg text-white">
                      {p.reputation_points || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-16 text-center">
              <div className="spinner mx-auto mb-3" style={{ color: "var(--color-primary)", width: "24px", height: "24px" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Querying on-chain identities...</p>
            </div>
          )}

          {!loading && leaders.length === 0 && (
            <div className="p-16 text-center">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No pioneers have claimed their reputation yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}