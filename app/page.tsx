"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconShield, IconChain, IconRocket, IconArrowRight, IconGitHub } from "@/app/components/SvgIcons";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Standard session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });

    // Detect OAuth login returns dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (provider: "github" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* ─── Top Bar ─── */}
        <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 animate-reveal">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-black/40 border border-white/5">
              <img src="/powr_logo.png" alt="POWR Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">POWR<span style={{ color: "var(--color-primary)" }}>.PRO</span></span>
          </div>
          <div className="flex items-center gap-3 animate-reveal stagger-1">
            <Link href="/whitepaper" className="btn-ghost text-sm hidden sm:inline-flex">Whitepaper</Link>
            <Link href="/leaderboard" className="btn-ghost text-sm hidden sm:inline-flex">Leaderboard</Link>
            <button onClick={() => handleLogin("github")} className="btn-primary text-sm" style={{ padding: "8px 18px" }}>
              Launch App
            </button>
          </div>
        </header>

        {/* ─── Hero ─── */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="animate-reveal stagger-2">
            <div className="inline-flex items-center gap-2 badge-blue mb-6 text-[10px] py-1 border-white/10" style={{ background: "rgba(109,129,150,0.1)", color: "var(--color-primary-light)" }}>
              <IconShield size={12} /> DECENTRALIZED REPUTATION PROTOCOL
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              The Truth Layer<br />
              <span className="gradient-text">of Web3</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              Verify your identity as a builder. Earn reputation through GitHub commits.
              Complete testnet quests. Prove you&apos;re real in a world of bots.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => handleLogin("github")} className="btn-primary text-base" style={{ padding: "14px 32px" }}>
                <IconGitHub size={20} /> Continue with GitHub
              </button>
              <button onClick={() => handleLogin("google")} className="btn-secondary text-base" style={{ padding: "14px 32px" }}>
                Continue with Google
              </button>
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="max-w-5xl mx-auto px-6 pb-24 animate-reveal stagger-4">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest mb-12" style={{ color: "var(--color-text-muted)" }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Connect", desc: "Link your GitHub, wallet, Twitter, and Discord to build your identity profile.", icon: IconChain, color: "var(--color-primary)" },
              { step: "02", title: "Verify", desc: "Complete testnet quests on Base and BOB. Sync GitHub activity. Share content.", icon: IconShield, color: "var(--color-primary-light)" },
              { step: "03", title: "Earn", desc: "Accumulate Reputation and Farmer XP. Climb the leaderboard. Prove you're real.", icon: IconRocket, color: "var(--color-text-muted)" },
            ].map((item, idx) => (
              <div key={item.step} className={`card-static p-7 animate-reveal`} style={{ animationDelay: `${0.4 + idx * 0.1}s` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `rgba(109,129,150,0.1)`, border: `1px solid rgba(109,129,150,0.2)` }}>
                  <item.icon size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <p className="text-xs font-bold mb-2 uppercase tracking-tighter" style={{ color: "var(--color-primary)" }}>{item.step}</p>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Testnet Quests", desc: "Execute real transactions on Base Sepolia and BOB testnet directly from your browser.", color: "var(--color-primary)", link: "/testnets" },
              { title: "Info-Fi AI Scanner", desc: "Connect your Twitter and earn XP for sharing Web3 content analyzed by our AI engine.", color: "var(--color-primary-light)", link: "/info-fi" },
              { title: "Global Leaderboard", desc: "Compete with other builders. Top performers earn badges and recognition.", color: "var(--color-text-muted)", link: "/leaderboard" },
              { title: "Whitepaper", desc: "Read the full protocol specification, tokenomics, and roadmap for POWR.PRO.", color: "var(--color-secondary)", link: "/whitepaper" },
            ].map((feat, idx) => (
              <Link key={feat.title} href={feat.link}
                className="card-static p-7 group flex items-start justify-between hover:border-border-hover transition-all animate-reveal"
                style={{ animationDelay: `${0.6 + idx * 0.1}s` }}>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{feat.title}</h3>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{feat.desc}</p>
                </div>
                <IconArrowRight size={20} className="mt-1 shrink-0 opacity-30 group-hover:opacity-100 transition-all" style={{ color: "var(--color-primary)" }} />
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t py-8 px-6" style={{ borderColor: "var(--color-border)" }}>
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade stagger-5">
            <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>© 2025 POWR.PRO — Decentralized Reputation Protocol</p>
            <div className="flex gap-4">
              <Link href="/whitepaper" className="text-xs hover:text-white transition-colors" style={{ color: "var(--color-text-muted)" }}>Whitepaper</Link>
              <Link href="/leaderboard" className="text-xs hover:text-white transition-colors" style={{ color: "var(--color-text-muted)" }}>Leaderboard</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}