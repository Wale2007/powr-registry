"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconArrowRight, IconExternalLink } from "@/app/components/SvgIcons";

const CHAINS = [
  {
    name: "Base Sepolia",
    slug: "base",
    description: "Base is a secure, low-cost, builder-friendly Ethereum L2 built on the OP Stack by Coinbase.",
    color: "#4A5D7A",
    chainId: "84532",
    tasks: 3,
    status: "Active",
  },
  {
    name: "BOB (Build on Bitcoin)",
    slug: "bob",
    description: "BOB is a hybrid L2 combining Bitcoin security with Ethereum smart contracts and full EVM compatibility.",
    color: "#7A6D4A",
    chainId: "808813",
    tasks: 3,
    status: "Active",
  },
];

export default function TestnetsPage() {
  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-10 animate-reveal">
          <p className="stat-label mb-1">Testnet Quests</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Earn XP by Doing <span className="gradient-text">Real Transactions</span>
          </h1>
          <p className="text-sm mt-2 max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
            Select a chain below to view the guide and execute testnet transactions directly from this app.
            Use your native <span className="font-bold text-white">POWR Wallet</span> to claim rewards.
          </p>
        </div>

        {/* Chain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {CHAINS.map((chain, i) => (
            <Link key={chain.slug} href={`/testnets/${chain.slug}`}
              className={`card p-7 group animate-reveal`} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: `rgba(109,129,150,0.1)`, border: `1px solid rgba(109,129,150,0.2)`, color: "var(--color-primary)" }}>
                    {chain.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">{chain.name}</h3>
                    <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Chain ID: {chain.chainId}</p>
                  </div>
                </div>
                <span className="badge-green text-[10px] py-0.5" style={{ background: "rgba(109,129,150,0.1)", color: "var(--color-success)" }}>{chain.status}</span>
              </div>
              <p className="text-sm mb-5" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{chain.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>{chain.tasks} Tasks Available</p>
                <div className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all" style={{ color: "var(--color-primary)" }}>
                  Start Quests <IconArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Getting Started */}
        <div className="card-static p-7 animate-reveal" style={{ animationDelay: "0.5s" }}>
          <h2 className="text-lg font-bold mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Setup Native Wallet", desc: "Open the Wallet tab to generate your persistent multi-chain identity automatically.", color: "var(--color-primary)" },
              { step: "2", title: "Get Test Tokens", desc: "Visit the faucet links on each chain's page to claim free testnet assets for gas.", color: "var(--color-success)" },
              { step: "3", title: "Complete Quests", desc: "Follow the guides and sign transactions natively to earn Reputation and XP.", color: "var(--color-primary-light)" },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="step-number shrink-0">{s.step}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
