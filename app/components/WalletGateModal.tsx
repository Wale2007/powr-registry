"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function WalletGateModal({
  userId,
  onConnected,
}: {
  userId: string;
  onConnected: (address: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask not detected. Please install MetaMask to continue.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = accounts[0] as string;

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ wallet_address: address.toLowerCase() })
        .eq("id", userId);

      if (dbError) {
        setError(dbError.message);
        return;
      }

      onConnected(address);
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Connection rejected. You must connect a wallet to proceed.");
      } else {
        setError(err.message || "Failed to connect wallet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(5,5,8,0.92)", backdropFilter: "blur(12px)" }}>
      
      <div className="w-full max-w-md mx-4 animate-fade-up rounded-2xl p-10 text-center"
        style={{
          background: "#12121a",
          border: "1px solid #2a2a3a",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}>
        
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #8A2BE2, #FF007A)", boxShadow: "0 8px 30px rgba(138,43,226,0.3)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-sm mb-8" style={{ color: "#9090a8", lineHeight: "1.6" }}>
          Link an Ethereum wallet to anchor your on-chain identity. This step is required to access Mission Control.
        </p>

        {error && (
          <div className="rounded-xl p-4 mb-6 text-sm text-left"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#f87171" }}>
            {error}
          </div>
        )}

        <button
          onClick={connectWallet}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ height: "52px", fontSize: "15px" }}>
          {loading ? (
            <><div className="spinner" /> Connecting...</>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
              </svg>
              Connect MetaMask
            </>
          )}
        </button>

        <p className="text-[10px] mt-6 uppercase tracking-widest" style={{ color: "#606078" }}>
          Secured by Ethereum
        </p>
      </div>
    </div>
  );
}
