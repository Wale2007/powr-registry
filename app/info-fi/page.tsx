"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconScan, IconTwitter, IconCheck, IconUser } from "@/app/components/SvgIcons";
import { scanContent } from "@/app/actions/content";

export default function InfoFiPage() {
  const [sessionId, setSessionId] = useState("");
  const [hasTwitter, setHasTwitter] = useState(false);
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string; xp?: number; keywords?: string[] } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setSessionId(session.user.id);
      
      const { data } = await supabase.from("profiles").select("twitter_username").eq("id", session.user.id).single();
      if (data && data.twitter_username) setHasTwitter(true);
    };
    init();
  }, [router]);

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    setResult(null);
    const res = await scanContent(sessionId, url);
    setResult({ success: res.success, msg: res.message, xp: res.xp, keywords: res.keywords });
    setScanning(false);
    if (res.success) setUrl("");
  };

  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <IconScan size={20} style={{ color: "#10B981" }} />
            </div>
            <h1 className="text-3xl font-bold">Info-Fi AI Engine</h1>
            <div className="flex items-center gap-2 badge-green text-[10px]">Active</div>
          </div>
          <p className="text-sm mt-2 max-w-xl" style={{ color: "#94A3B8" }}>
            Our AI engine scans your content to verify quality Web3 and POWR.PRO discussions. 
            Earn XP based on the context and keywords extracted.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Scanner */}
          <div className="md:col-span-2 space-y-6 fade-d1">
            
            {!hasTwitter && (
              <div className="card-static p-5 flex items-center justify-between" style={{ border: "1px solid rgba(236,72,153,0.3)" }}>
                <div>
                  <p className="font-semibold text-white text-sm">Twitter Profile Missing</p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>Connect your Twitter to maximize scan accuracy.</p>
                </div>
                <Link href="/profile" className="btn-secondary text-xs" style={{ padding: "8px 16px" }}>
                  <IconUser size={14} /> Link Profile
                </Link>
              </div>
            )}

            <div className="card-static p-8">
              <h2 className="text-lg font-bold mb-6">Scan URL</h2>
              
              <div className="relative mb-6">
                <input 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  placeholder="Paste Twitter/X URL here..." 
                  className="input" 
                  style={{ padding: "16px 20px" }}
                  disabled={scanning}
                />
                <IconTwitter size={20} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50" style={{ color: "#1DA1F2" }} />
                
                {scanning && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-y-0 w-1/3"
                      style={{ 
                        background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)",
                        animation: "scan-line 1.5s ease-in-out infinite" 
                      }} />
                  </div>
                )}
              </div>

              {result && (
                <div className={`p-5 rounded-xl mb-6 ${result.success ? 'bg-secondary/10 border-secondary/20 border' : 'bg-red-500/10 border-red-500/20 border'}`}>
                  <div className="flex items-start gap-3">
                    {result.success ? <IconCheck size={20} style={{ color: "#34D399" }} /> : <div className="text-red-400 mt-0.5">⚠️</div>}
                    <div>
                      <p className="text-sm font-semibold text-white">{result.msg}</p>
                      {result.success && result.keywords && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {result.keywords.map(kw => (
                            <span key={kw} className="bg-black/20 px-2 py-1 rounded text-xs" style={{ color: "#34D399" }}>#{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {result.success && result.xp && (
                    <div className="mt-4 text-center border-t border-white/5 pt-3">
                      <span className="text-2xl font-black text-white">+{result.xp} <span style={{ color: "#10B981" }}>XP</span></span>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={handleScan}
                disabled={scanning || !url}
                className="btn-success w-full" 
                style={{ padding: "16px", height: "56px" }}>
                {scanning ? <><div className="spinner"/> Analyzing Content...</> : "Start AI Scan"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 fade-d2">
            <div className="card-static p-6">
              <p className="stat-label mb-4">How It Works</p>
              <ul className="space-y-4 text-sm" style={{ color: "#94A3B8" }}>
                <li className="flex gap-2"><span style={{ color: "#10B981" }}>1.</span> Paste a URL linking to a Web3-related post.</li>
                <li className="flex gap-2"><span style={{ color: "#10B981" }}>2.</span> Our AI engine fetches the content and analyzes context.</li>
                <li className="flex gap-2"><span style={{ color: "#10B981" }}>3.</span> Engine identifies keywords like POWR, DeFi, Base, AI.</li>
                <li className="flex gap-2"><span style={{ color: "#10B981" }}>4.</span> XP is awarded dynamically (+10 base, +5 per keyword).</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
