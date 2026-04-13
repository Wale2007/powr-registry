"use client";

import { useState } from "react";
import { verifyContent } from "@/app/actions/github";

export default function InfoFiCard({ userId }: { userId: string }) {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ text: string; isError: boolean } | null>(null);

  const handleScan = async () => {
    if (!url.trim()) {
      setResult({ text: "Please enter a URL.", isError: true });
      return;
    }
    setScanning(true);
    setResult(null);
    await new Promise((res) => setTimeout(res, 600));
    const response = await verifyContent(userId, url);
    setResult({
      text: response.message || (response.success ? "Verified!" : "Failed."),
      isError: !response.success,
    });
    if (response.success) setUrl("");
    setScanning(false);
  };

  return (
    <div className="card rounded-2xl p-6 fade-stagger-5">
      <div className="flex items-center gap-2 mb-1">
        <p className="stat-label">Info-Fi AI Engine</p>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#34D399" }} />
      </div>
      <p className="text-xs mb-5" style={{ color: "#606078" }}>
        Share Web3 content on social media and earn XP.
      </p>

      <div className="relative mb-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste X, Lens, or Warpcast URL..."
          className="input text-sm"
        />
        {scanning && (
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div className="absolute inset-y-0 w-1/3"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(138,43,226,0.1), transparent)",
                animation: "scan-line 1.2s ease-in-out infinite"
              }} />
          </div>
        )}
      </div>

      {result && (
        <p className={`text-xs mb-3 ${result.isError ? "text-red-400" : "text-accent-emerald"}`}>
          {result.text}
        </p>
      )}

      <button
        onClick={handleScan}
        disabled={scanning}
        className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ height: "44px" }}>
        {scanning ? (
          <><div className="spinner" /> Analyzing...</>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            Scan Content (+15 XP)
          </>
        )}
      </button>
    </div>
  );
}
