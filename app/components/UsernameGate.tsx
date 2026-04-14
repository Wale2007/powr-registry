"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UsernameGate({ children, initialProfile }: { children: React.ReactNode, initialProfile?: any }) {
  const [profile, setProfile] = useState<any>(initialProfile || null);
  const [loading, setLoading] = useState(!initialProfile);
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialProfile) return;
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [initialProfile]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const sanitized = usernameInput.trim().toLowerCase();
    
    if (sanitized.length < 3) return setError("Username must be at least 3 characters.");
    if (sanitized.length > 20) return setError("Username must be less than 20 characters.");
    if (!/^[a-z0-9_]+$/.test(sanitized)) return setError("Only lowercase letters, numbers, and underscores allowed.");

    setSaving(true);
    
    try {
      // Check availability
      const { data: existing } = await supabase.from("profiles").select("id").eq("username", sanitized).single();
      if (existing) {
        setError("Username is already taken!");
        setSaving(false);
        return;
      }

      // Claim it
      const { error: updateError } = await supabase.from("profiles").update({ username: sanitized }).eq("id", profile.id);
      if (updateError) {
        setError(updateError.message);
      } else {
        setProfile({ ...profile, username: sanitized });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
    setSaving(false);
  };

  if (loading) return null; // Don't block the render if checking locally, or show a spinner

  if (profile && !profile.username) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade">
        <div className="card w-full max-w-md p-8 animate-reveal border-white/10" style={{ background: "var(--color-bg-card-elevated)" }}>
          <div className="w-12 h-12 rounded-xl mb-6 mx-auto flex items-center justify-center" style={{ background: "rgba(109,129,150,0.1)", border: "1px solid rgba(109,129,150,0.2)" }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h2 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Claim Your Username</h2>
          <p className="text-sm text-center mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Every pioneer on POWR.PRO needs a unique identifier. Choose carefully, as this will represent your reputation on the leaderboard.
          </p>

          <form onSubmit={handleClaim} className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                placeholder="e.g. vitalik_buterin"
                className="input text-center text-lg font-mono tracking-tight"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.toLowerCase())}
                autoComplete="off"
                spellCheck="false"
              />
              {error && <p className="text-xs mt-2 text-center text-accent-red font-medium">{error}</p>}
            </div>
            <button type="submit" disabled={saving || !usernameInput.trim()} className="btn-primary w-full h-12">
              {saving ? <div className="spinner" /> : "Secure Username"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If they have a username, render the app normally
  return <>{children}</>;
}
