"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ReferralCard({ walletAddress }: { walletAddress: string }) {
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}?ref=${walletAddress}`
      : "";

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("referred_by", walletAddress.toLowerCase());
      setReferralCount(count || 0);
    };
    if (walletAddress) fetchCount();
  }, [walletAddress]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = referralLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl p-6 fade-stagger-4" style={{
      background: "linear-gradient(135deg, #8A2BE2 0%, #6d28d9 50%, #4c1d95 100%)",
      boxShadow: "0 8px 40px rgba(138,43,226,0.2)"
    }}>
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-lg font-bold text-white">Refer & Earn</h4>
        <span className="text-2xl">🎁</span>
      </div>
      <p className="text-xs text-white/60 mb-4">
        Invite builders to the POWR ecosystem.
      </p>

      <div className="flex items-center gap-2 mb-5 rounded-xl py-3 px-4"
        style={{ background: "rgba(0,0,0,0.2)" }}>
        <span className="text-2xl font-black text-white">{referralCount}</span>
        <span className="text-xs text-white/50 uppercase tracking-wider">Pioneers Recruited</span>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200"
        style={{
          background: copied ? "#34D399" : "white",
          color: copied ? "white" : "#0a0a0f",
        }}>
        {copied ? "✓ Link Copied!" : "Copy Invite Link"}
      </button>
    </div>
  );
}
