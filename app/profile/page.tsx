"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconWallet, IconGitHub, IconDiscord, IconTwitter, IconCheck, IconShield } from "@/app/components/SvgIcons";
import { getCommitCount, updateReputation } from "@/app/actions/github";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [twitterInput, setTwitterInput] = useState("");
  const [discordInput, setDiscordInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // 1. Catch redirect errors from Supabase
      if (window.location.hash.includes("error_description")) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorMsg = hashParams.get("error_description")?.replace(/\+/g, " ");
        if (errorMsg) {
          alert(`Connection Error: ${errorMsg}\n\n(This usually happens if that social account is already linked to a different login!)`);
        }
      }

      if (window.location.hash.includes("access_token")) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setSessionId(session.user.id);
      
      const { data: userAuth } = await supabase.auth.getUser();
      const identities = userAuth?.user?.identities || [];
      
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) {
        let updates: any = {};
        let needUpdate = false;
        
        identities.forEach(id => {
          if (id.provider === "twitter" && !data.twitter_username) {
            updates.twitter_username = id.identity_data?.preferred_username || id.identity_data?.user_name || id.identity_data?.name;
            needUpdate = true;
          }
          if (id.provider === "discord" && !data.discord_username) {
            updates.discord_username = id.identity_data?.custom_claims?.global_name || id.identity_data?.user_name || id.identity_data?.name;
            needUpdate = true;
          }
          if (id.provider === "github" && !data.github_username) {
            updates.github_username = id.identity_data?.preferred_username || id.identity_data?.user_name;
            needUpdate = true;
          }
        });

        if (needUpdate) {
          await supabase.from("profiles").update(updates).eq("id", session.user.id);
          Object.assign(data, updates);
        }

        setUser(data);

        // Auto-Sync GitHub if connected but score is 0
        if (data.github_username && (!data.reputation_points || data.reputation_points === 0)) {
          getCommitCount(data.github_username).then(async (res) => {
            if (res.success) {
              await updateReputation(session.user.id, data.github_username, res.commitCount, res.rank);
              setUser((p: any) => ({ ...p, reputation_points: res.commitCount, role: res.rank }));
            }
          });
        }
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const connectWallet = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!window.ethereum) {
      if (isMobile) {
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      } else {
        alert("Please install MetaMask to connect your wallet!");
      }
      return;
    }
    setSaving("wallet");
    try {
      // Force Explicit Unlock Popup
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0].toLowerCase();
      await supabase.from("profiles").update({ wallet_address: addr }).eq("id", sessionId);
      setUser((p: any) => ({ ...p, wallet_address: addr }));
    } catch (err: any) {
      let msg = err.message || "Connection failed. Please check your MetaMask app.";
      if (msg.toLowerCase().includes("at least one account")) {
        msg = "Your browser's built-in wallet (like Brave Wallet) is empty! Please set up an account, or go to your browser settings and switch your 'Default Web3 Wallet' to MetaMask.";
      }
      alert("Wallet Error: " + msg);
    }
    setSaving(null);
  };

  const disconnectWallet = async () => {
    setSaving("disconnect");
    await supabase.from("profiles").update({ wallet_address: null }).eq("id", sessionId);
    setUser((p: any) => ({ ...p, wallet_address: null }));
    setSaving(null);
  };

  const handleOAuth = async (provider: "twitter" | "discord" | "github") => {
    setSaving(provider);
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/profile` },
    });
    if (error) {
      alert(`Could not start linking: ${error.message}`);
    }
    setSaving(null);
  };

  const handleGitHubSync = async () => {
    if (!user?.github_username) return;
    setSyncing(true);
    const res = await getCommitCount(user.github_username);
    if (res.success) {
      await updateReputation(sessionId, user.github_username, res.commitCount, res.rank);
      setUser((p: any) => ({ ...p, reputation_points: res.commitCount, role: res.rank }));
    }
    setSyncing(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B1120" }}><div className="spinner" style={{ color: "#3B82F6", width: 28, height: 28 }} /></div>;
  if (!user) return null;

  const connections = [
    { key: "wallet", label: "Ethereum Wallet", icon: IconWallet, connected: !!user.wallet_address, value: user.wallet_address ? `${user.wallet_address.slice(0,6)}...${user.wallet_address.slice(-4)}` : null, color: "#3B82F6" },
    { key: "github", label: "GitHub", icon: IconGitHub, connected: !!user.github_username, value: user.github_username, color: "#F1F5F9" },
    { key: "twitter", label: "Twitter / X", icon: IconTwitter, connected: !!user.twitter_username, value: user.twitter_username ? `@${user.twitter_username}` : null, color: "#1DA1F2" },
    { key: "discord", label: "Discord", icon: IconDiscord, connected: !!user.discord_username, value: user.discord_username, color: "#5865F2" },
  ];

  const completedCount = connections.filter(c => c.connected).length;

  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-up">
          <p className="stat-label mb-1">Identity</p>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-sm mt-2" style={{ color: "#94A3B8" }}>Connect all accounts to maximize your reputation score.</p>
        </div>

        {/* Progress */}
        <div className="card-static p-5 mb-8 animate-fade-up">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-white">Profile Completion</p>
            <span className="text-sm font-bold" style={{ color: "#3B82F6" }}>{completedCount}/4</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${completedCount * 25}%` }} /></div>
        </div>

        {/* Connection Cards */}
        <div className="space-y-4">
          {connections.map((conn, i) => (
            <div key={conn.key} className={`card-static p-5 fade-d${i+1}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${conn.color}12`, border: `1px solid ${conn.color}22` }}>
                    <conn.icon size={20} style={{ color: conn.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{conn.label}</p>
                    {conn.connected ? (
                      <p className="text-xs mt-0.5" style={{ color: "#10B981" }}>{conn.value}</p>
                    ) : (
                      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Not connected</p>
                    )}
                  </div>
                </div>
                <div>
                  {conn.connected ? (
                    <div className="flex items-center gap-3">
                      <span className="badge-green text-xs"><IconCheck size={12} /> Connected</span>
                      {conn.key === "wallet" && (
                        <button onClick={disconnectWallet} disabled={saving === "disconnect"} className="btn-ghost text-xs text-accent-red hover:text-accent-red" style={{ padding: "4px 8px" }}>
                          {saving === "disconnect" ? "..." : "Disconnect"}
                        </button>
                      )}
                    </div>
                  ) : conn.key === "wallet" ? (
                    <button onClick={connectWallet} disabled={saving === "wallet"} className="btn-primary text-xs" style={{ padding: "6px 16px" }}>
                      {saving === "wallet" ? <div className="spinner" /> : "Connect"}
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Social inputs */}
              {(conn.key === "twitter" || conn.key === "discord" || conn.key === "github") && !conn.connected && (
                <div className="flex mt-4">
                  <button 
                    onClick={() => handleOAuth(conn.key as "twitter" | "discord" | "github")} 
                    disabled={saving === conn.key} 
                    className="btn-primary flex-1 text-sm bg-white/5 hover:bg-white/10" 
                    style={{ padding: "10px 16px" }}
                  >
                    {saving === conn.key ? <div className="spinner" /> : `Connect ${conn.label}`}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* GitHub Sync */}
        {user.github_username && (
          <div className="card-static p-5 mt-6 fade-d5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconShield size={18} style={{ color: "#10B981" }} />
                <div>
                  <p className="text-sm font-semibold text-white">GitHub Activity Sync</p>
                  <p className="text-xs" style={{ color: "#64748B" }}>{user.reputation_points} commits · {user.role || "bronze"} tier</p>
                </div>
              </div>
              <button onClick={handleGitHubSync} disabled={syncing} className="btn-secondary text-xs" style={{ padding: "6px 16px" }}>
                {syncing ? <div className="spinner" /> : "Sync Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
