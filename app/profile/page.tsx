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
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
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

  const connectWallet = () => {
    router.push("/wallet");
  };

  const disconnectWallet = async () => {
    alert("Custodian wallets cannot be disconnected. They are bound mathematically to your profile.");
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

  const handleEditUsername = async () => {
    if (editingUsername) {
      const sanitized = newUsername.trim().toLowerCase();
      if (sanitized === user.username) { setEditingUsername(false); return; }
      if (sanitized.length < 3 || sanitized.length > 20 || !/^[a-z0-9_]+$/.test(sanitized)) {
        setUsernameError("Invalid format"); return;
      }
      setSaving("username");
      const { data: existing } = await supabase.from("profiles").select("id").eq("username", sanitized).single();
      if (existing) {
        setUsernameError("Already taken!");
        setSaving(null);
        return;
      }
      await supabase.from("profiles").update({ username: sanitized }).eq("id", sessionId);
      setUser({ ...user, username: sanitized });
      setEditingUsername(false);
      setUsernameError("");
      setSaving(null);
    } else {
      setNewUsername(user.username || "");
      setEditingUsername(true);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" style={{ color: "var(--color-primary)", width: 28, height: 28 }} /></div>;
  if (!user) return null;

  const connections = [
    { key: "wallet", label: "Ethereum Wallet", icon: IconWallet, connected: !!user.wallet_address, value: user.wallet_address ? `${user.wallet_address.slice(0,6)}...${user.wallet_address.slice(-4)}` : null, color: "var(--color-primary)" },
    { key: "github", label: "GitHub", icon: IconGitHub, connected: !!user.github_username, value: user.github_username, color: "var(--color-text)" },
    { key: "twitter", label: "Twitter / X", icon: IconTwitter, connected: !!user.twitter_username, value: user.twitter_username ? `@${user.twitter_username}` : null, color: "#1DA1F2" },
    { key: "discord", label: "Discord", icon: IconDiscord, connected: !!user.discord_username, value: user.discord_username, color: "#5865F2" },
  ];

  const completedCount = connections.filter(c => c.connected).length;

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-reveal">
          <p className="stat-label mb-1">Identity</p>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>Connect all accounts to maximize your reputation score.</p>
        </div>

        {/* Username Banner */}
        <div className="card-static p-6 mb-6 animate-reveal stagger-1">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-white mb-1">POWR Protocol Username</p>
              {editingUsername ? (
                 <div>
                   <div className="flex items-center gap-2">
                     <span className="text-xl font-bold text-gray-500">@</span>
                     <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value.toLowerCase())} placeholder="username" className="input text-lg font-mono tracking-tight max-w-[200px]" style={{ padding: "6px 12px" }} />
                   </div>
                   {usernameError && <p className="text-xs text-accent-red mt-1">{usernameError}</p>}
                 </div>
              ) : (
                <p className="text-2xl font-bold font-mono tracking-tight" style={{ color: "var(--color-primary)" }}>@{user.username || "unclaimed"}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              {editingUsername && <button onClick={() => { setEditingUsername(false); setUsernameError(""); }} className="btn-ghost text-sm">Cancel</button>}
              <button 
                onClick={handleEditUsername} 
                disabled={saving === "username"}
                className={editingUsername ? "btn-success text-sm" : "btn-secondary text-sm"}
                style={{ padding: "8px 16px" }}
              >
                {saving === "username" ? <div className="spinner" /> : editingUsername ? "Save" : "Edit Username"}
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card-static p-5 mb-8 animate-reveal stagger-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-white">Profile Completion</p>
            <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>{completedCount}/4</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${completedCount * 25}%` }} /></div>
        </div>

        {/* Connection Cards */}
        <div className="space-y-4">
          {connections.map((conn, i) => (
            <div key={conn.key} className={`card-static p-5 animate-reveal`} style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `rgba(109,129,150,0.1)`, border: `1px solid rgba(109,129,150,0.2)` }}>
                    <conn.icon size={20} style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{conn.label}</p>
                    {conn.connected ? (
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-success)" }}>{conn.value}</p>
                    ) : (
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Not connected</p>
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
          <div className="card-static p-5 mt-6 animate-reveal" style={{ animationDelay: "0.8s" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconShield size={18} style={{ color: "var(--color-success)" }} />
                <div>
                  <p className="text-sm font-semibold text-white">GitHub Activity Sync</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{user.reputation_points} commits · {user.role || "bronze"} tier</p>
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
