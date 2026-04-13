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
    color: "#3B82F6",
    chainId: "84532",
    tasks: 3,
    status: "Active",
  },
  {
    name: "BOB (Build on Bitcoin)",
    slug: "bob",
    description: "BOB is a hybrid L2 combining Bitcoin security with Ethereum smart contracts and full EVM compatibility.",
    color: "#F59E0B",
    chainId: "808813",
    tasks: 3,
    status: "Active",
  },
];

export default function TestnetsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-10 animate-fade-up">
          <p className="stat-label mb-1">Testnet Quests</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Earn XP by Doing <span className="gradient-text">Real Transactions</span>
          </h1>
          <p className="text-sm mt-2 max-w-xl" style={{ color: "#94A3B8" }}>
            Select a chain below to view the guide and execute testnet transactions directly from this app.
            You&apos;ll need MetaMask and free testnet tokens.
          </p>
        </div>

        {/* Chain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {CHAINS.map((chain, i) => (
            <Link key={chain.slug} href={`/testnets/${chain.slug}`}
              className={`card p-7 group fade-d${i + 1}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: `${chain.color}15`, border: `1px solid ${chain.color}25`, color: chain.color }}>
                    {chain.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">{chain.name}</h3>
                    <p className="text-[11px]" style={{ color: "#64748B" }}>Chain ID: {chain.chainId}</p>
                  </div>
                </div>
                <span className="badge-green text-[10px]">{chain.status}</span>
              </div>
              <p className="text-sm mb-5" style={{ color: "#94A3B8", lineHeight: 1.6 }}>{chain.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: chain.color }}>{chain.tasks} Tasks Available</p>
                <div className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all" style={{ color: chain.color }}>
                  Start Quests <IconArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Getting Started */}
        <div className="card-static p-7 fade-d3">
          <h2 className="text-lg font-bold mb-4">Getting Started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Install MetaMask", desc: "Download the MetaMask browser extension from metamask.io and create a wallet.", color: "#3B82F6" },
              { step: "2", title: "Get Test Tokens", desc: "Visit the faucet links on each chain's page to claim free testnet ETH.", color: "#10B981" },
              { step: "3", title: "Complete Quests", desc: "Follow the step-by-step guide and execute transactions to earn XP.", color: "#F59E0B" },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <div className="step-number shrink-0">{s.step}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
