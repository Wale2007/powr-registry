"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconRocket, IconScan, IconTrophy, IconUser, IconFire, IconArrowRight, IconShield } from "@/app/components/SvgIcons";
import { dailyCheckIn } from "@/app/actions/github";

interface Profile {
  id: string; wallet_address: string | null; github_username: string | null;
  username: string | null;
  reputation_points: number; farmer_xp: number; daily_streak: number; role: string;
  twitter_username?: string | null; discord_username?: string | null;
}

export default function Dashboard() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const router = useRouter();

  const [feedItems, setFeedItems] = useState([
    { id: 1, time: "Just now", text: "Pioneer 0x7F... just opened a 10x Long on $ETH", color: "var(--color-success)" },
    { id: 2, time: "2 min ago", text: "Pioneer Wale2007 claimed 500 XP", color: "var(--color-primary)" },
    { id: 3, time: "5 min ago", text: "Oracle 0xA1... liquidation alert triggered", color: "var(--color-text-secondary)" },
    { id: 4, time: "12 min ago", text: "Node 0x33... verified BOB Network task", color: "var(--color-primary-light)" },
  ]);

  useEffect(() => {
    // Simulate real-time alpha feed
    const interval = setInterval(() => {
      const items = [
        { text: `Pioneer 0x${Math.random().toString(16).substring(2, 4).toUpperCase()}... synced Trader Node`, color: "var(--color-primary)" },
        { text: `Oracle 0x${Math.random().toString(16).substring(2, 4).toUpperCase()}... hit Health Factor 0.9!`, color: "var(--color-accent-red)" },
        { text: `Whale 0x${Math.random().toString(16).substring(2, 4).toUpperCase()}... added 50 ETH LP on Base`, color: "var(--color-success)" },
        { text: `Top Tier Wale2007 just claimed 50 Sniper XP`, color: "var(--color-primary-light)" }
      ];
      const newItem = items[Math.floor(Math.random() * items.length)];
      setFeedItems(prev => [{ id: Date.now(), time: "Just now", ...newItem }, ...prev.map(p => ({ ...p, time: p.time === "Just now" ? "1 min ago" : p.time })).slice(0, 3)]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    const result = await dailyCheckIn(sessionId);
    if (result.success) {
      setCheckedIn(true);
      setCheckInMsg("Check-in successful! +10 XP");
      setUser(prev => prev ? { ...prev, daily_streak: result.streak || 0, farmer_xp: (prev.farmer_xp || 0) + 10 } : null);
    } else {
      setCheckInMsg(result.message || "Already checked in.");
    }
    setCheckInLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="spinner mx-auto mb-3" style={{ color: "var(--color-primary)", width: 28, height: 28 }} />
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading Mission Control...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const quickLinks = [
    { href: "/testnets", title: "Testnet Quests", desc: "Execute transactions on Base & BOB", icon: IconRocket, color: "var(--color-primary)" },
    { href: "/info-fi", title: "Info-Fi Scanner", desc: "Scan content & earn XP", icon: IconScan, color: "var(--color-success)" },
    { href: "/leaderboard", title: "Leaderboard", desc: "View global rankings", icon: IconTrophy, color: "var(--color-text-primary)" },
    { href: "/profile", title: "Your Profile", desc: "Complete your identity", icon: IconUser, color: "var(--color-secondary-dark)" },
  ];

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-reveal">
          <p className="stat-label mb-1">Mission Control</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, <span className="gradient-text" style={{ background: "linear-gradient(135deg, var(--color-text-primary), var(--color-primary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>@{user.username || user.github_username || "Pioneer"}</span>
          </h1>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Reputation", value: user.reputation_points, color: "var(--color-primary)", stagger: "stagger-1" },
            { label: "Farmer XP", value: user.farmer_xp, color: "var(--color-success)", stagger: "stagger-2" },
            { label: "Streak", value: `${user.daily_streak} days`, color: "var(--color-text-primary)", stagger: "stagger-3" },
            { label: "Tier", value: user.role || "Bronze", color: "var(--color-secondary-dark)", stagger: "stagger-4" },
          ].map(s => (
            <div key={s.label} className={`card-static p-5 text-center animate-reveal ${s.stagger}`}>
              <p className="stat-label mb-1">{s.label}</p>
              <p className="text-2xl font-bold capitalize" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Quick Links */}
          <div className="lg:col-span-2 space-y-4 animate-reveal stagger-2">
            <p className="stat-label ml-1">Quick Actions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((ql, idx) => (
                <Link key={ql.href} href={ql.href} className={`card p-5 flex items-start gap-4 group animate-reveal stagger-${idx + 1}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `rgba(109,129,150,0.1)`, border: `1px solid rgba(109,129,150,0.2)` }}>
                    <ql.icon size={20} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm group-hover:text-primary transition-colors">{ql.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{ql.desc}</p>
                  </div>
                  <IconArrowRight size={16} className="mt-1 shrink-0 opacity-0 group-hover:opacity-60 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Daily Check-In */}
          <div className="space-y-4 animate-reveal stagger-3">
            <p className="stat-label ml-1">Daily Check-In</p>
            <div className="card-static p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                   style={{ background: "rgba(109,129,150,0.1)", border: "1px solid rgba(109,129,150,0.2)" }}>
                  <IconFire size={22} style={{ color: "var(--color-primary)" }} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{user.daily_streak}</p>
                  <p className="stat-label">Day Streak</p>
                </div>
              </div>
              {checkInMsg && <p className={`text-xs mb-3 ${checkedIn ? "text-success" : "text-primary"}`}>{checkInMsg}</p>}
              <button onClick={handleCheckIn} disabled={checkInLoading || checkedIn}
                className={`w-full text-sm font-semibold ${checkedIn ? "btn-secondary" : "btn-primary"}`}
                style={{ height: 44, opacity: checkInLoading ? 0.6 : 1 }}>
                {checkInLoading ? <><div className="spinner" /> Checking in...</> : checkedIn ? "✓ Checked In" : "Check In (+10 XP)"}
              </button>
            </div>

            {/* Profile Completion */}
            <div className="card-static p-6 animate-reveal stagger-4">
              <div className="flex items-center justify-between mb-3">
                <p className="stat-label">Profile Completion</p>
                <span className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                  {[user.wallet_address, user.github_username, user.twitter_username, user.discord_username].filter(Boolean).length}/4
                </span>
              </div>
              <div className="progress-bar mb-4 overflow-hidden bg-black/20">
                <div className="progress-fill" style={{ background: "var(--color-primary)", width: `${[user.wallet_address, user.github_username, user.twitter_username, user.discord_username].filter(Boolean).length * 25}%` }} />
              </div>
              <Link href="/profile" className="btn-secondary w-full text-sm" style={{ height: 40 }}>
                <IconUser size={16} /> Complete Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 animate-reveal stagger-4">
          <p className="stat-label ml-1 mb-2">Alpha Radar (Live Feed)</p>
          <div className="card-static p-0 overflow-hidden border-white/5" style={{ background: "rgba(109,129,150,0.05)" }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5" style={{ background: "rgba(109,129,150,0.1)" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-xs font-mono ml-2 text-primary opacity-80">node@powr.pro:~/radar$ tail -f events.log</span>
            </div>
            <div className="p-4 font-mono text-sm space-y-3">
              {feedItems.map((item) => (
                <div key={item.id} className="flex gap-4 animate-fade-in-up">
                  <span className="text-gray-500 shrink-0 opacity-70">[{item.time}]</span>
                  <span style={{ color: item.color }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}