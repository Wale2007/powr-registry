"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconShield, IconRocket, IconScan, IconFire } from "@/app/components/SvgIcons";
import { syncTraderNode, syncRiskOracle } from "@/app/actions/defi";

interface Profile {
  id: string;
  win_rate_30d: number | null;
  total_volume_usd: number | null;
  health_factor: number | null;
  sniper_xp: number;
}

export default function TraderNode() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const router = useRouter();

  const [pnlSyncing, setPnlSyncing] = useState(false);
  const [riskSyncing, setRiskSyncing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setSessionId(session.user.id);
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) setUser(data as Profile);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSyncPnL = async () => {
    setPnlSyncing(true);
    const result = await syncTraderNode(sessionId);
    if (result.success && result.winRate !== undefined) {
      setUser(prev => prev ? { 
        ...prev, 
        win_rate_30d: result.winRate as number, 
        total_volume_usd: result.volume as number,
        sniper_xp: (prev.sniper_xp || 0) + (result.xp || 50)
      } : null);
    }
    setPnlSyncing(false);
  };

  const handleSyncRisk = async () => {
    setRiskSyncing(true);
    const result = await syncRiskOracle(sessionId);
    if (result.success && result.healthFactor !== undefined) {
      setUser(prev => prev ? { 
        ...prev, 
        health_factor: result.healthFactor as number
      } : null);
    }
    setRiskSyncing(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B1120" }}>
      <div className="spinner mx-auto mb-3" style={{ color: "#3B82F6", width: 28, height: 28 }} />
    </div>
  );

  if (!user) return null;

  // Compute Risk Oracle Styles based on Health Factor
  const hf = user.health_factor || 0;
  let riskColor = "#94A3B8"; // Default slate
  let riskShadow = "none";
  let riskText = "Unsynced";
  let riskAnimation = "";

  if (hf > 0) {
    if (hf < 1.5) {
      riskColor = "#EF4444"; // Red Danger
      riskShadow = "0 0 20px rgba(239, 68, 68, 0.4)";
      riskText = "Liquidation Risk";
      riskAnimation = "animate-pulse";
    } else if (hf >= 2.0) {
      riskColor = "#10B981"; // Green Safe
      riskShadow = "0 0 20px rgba(16, 185, 129, 0.4)";
      riskText = "Safe / Healthy";
    } else {
      riskColor = "#F59E0B"; // Amber Warning
      riskShadow = "0 0 20px rgba(245, 158, 11, 0.4)";
      riskText = "Moderate Risk";
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <p className="stat-label mb-1">DeFi Reputation</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            The <span className="gradient-text">Trader Node</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: "#94A3B8" }}>
            Prove your legendary on-chain performance without sharing fake PnL screenshots. 
            Sync your activity to earn Sniper XP and manage your risk vector via the Degen Oracle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Proof-of-PnL */}
          <div className="card-static p-6 flex flex-col justify-between fade-d1">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                  <IconScan size={20} style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">Proof-of-PnL</h2>
                  <p className="text-xs" style={{ color: "#64748B" }}>30-Day On-Chain Activity</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl" style={{ background: "rgba(11,17,32,0.5)", border: "1px solid #1E2D4A" }}>
                  <p className="stat-label">Win Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {user.win_rate_30d ? `${user.win_rate_30d}%` : "—"}
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: "rgba(11,17,32,0.5)", border: "1px solid #1E2D4A" }}>
                  <p className="stat-label">Volume (USD)</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {user.total_volume_usd ? `$${user.total_volume_usd.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSyncPnL} 
              disabled={pnlSyncing}
              className="btn-primary w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {pnlSyncing ? <div className="spinner" /> : <><IconRocket size={16} /> Sync On-Chain PnL</>}
            </button>
            <p className="text-center text-xs mt-3 flex items-center gap-1 justify-center" style={{ color: "#10B981" }}>
              <IconFire size={12} /> Syncing awards Sniper XP
            </p>
          </div>

          {/* Card 2: Degen Risk Oracle */}
          <div className="card-static p-6 flex flex-col justify-between fade-d2" style={{ boxShadow: riskShadow, transition: "box-shadow 0.5s ease" }}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
                  <IconShield size={20} style={{ color: riskColor }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">Degen Risk Oracle</h2>
                  <p className="text-xs" style={{ color: "#64748B" }}>Lending & Borrowing Safety</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 mb-2">
                <div className={`relative flex items-center justify-center rounded-full w-32 h-32 mb-2 ${riskAnimation}`} style={{ background: "rgba(11,17,32,0.5)", border: `2px solid ${riskColor}` }}>
                  <div className="text-center">
                    <p className="text-4xl font-black tracking-tighter" style={{ color: riskColor }}>
                      {hf > 0 ? hf : "—"}
                    </p>
                    <p className="text-xs uppercase font-bold mt-1 tracking-widest" style={{ color: riskColor }}>
                      Health
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold mt-2" style={{ color: riskColor }}>{riskText}</p>
              </div>
            </div>

            <button 
              onClick={handleSyncRisk} 
              disabled={riskSyncing}
              className="btn-secondary w-full h-11 text-sm font-semibold flex items-center justify-center gap-2"
            >
              {riskSyncing ? <div className="spinner" /> : "Run Oracle Scan"}
            </button>
          </div>
        </div>

        {/* Tutorial Section */}
        <div className="card-static p-6 fade-d3">
          <h3 className="text-lg font-bold text-white mb-4">How the Trader Node Works</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">1</div>
              <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                <strong className="text-white">Proof-of-PnL:</strong> Stop pasting fake Binance screenshots. The Trader Node indexes your connected EVM wallets and calculates your actual 30-Day Win Rate and Volume. We verify the math on-chain.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">2</div>
              <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                <strong className="text-white">Degen Risk Oracle:</strong> Checks your active positions on Aave, Compound, and other lending markets to calculate a unified Health Factor. A pulse below 1.5 indicates severe liquidation warnings.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">3</div>
              <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                <strong className="text-white">Privacy Preserved:</strong> We do not publish your absolute token balances or specific entry/exit prices. We only publish verified percentages (Win Rate) and aggregate tiers (Volume, Health Factor) so you can prove your skill without doxxing your stack.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
