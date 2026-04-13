"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";

export default function Whitepaper() {
  const sections = [
    { id: "abstract", title: "1. Abstract" },
    { id: "problem", title: "2. The Problem" },
    { id: "solution", title: "3. The Solution" },
    { id: "mechanics", title: "4. Protocol Mechanics" },
    { id: "roadmap", title: "5. Roadmap" },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Table of Contents */}
        <div className="hidden md:block w-64 shrink-0 fade-d1">
          <div className="sticky top-24 card-static p-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#64748B" }}>Content</p>
            <ul className="space-y-3">
              {sections.map(s => (
                <li key={s.id}>
                  <button 
                    onClick={() => scrollTo(s.id)}
                    className="text-sm font-medium hover:text-primary transition-colors text-left"
                    style={{ color: "#94A3B8" }}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl fade-d2">
          
          <div className="mb-16">
            <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary mb-4">
              V1.0 - Draft
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">POWR.PRO Protocol</h1>
            <p className="text-lg" style={{ color: "#94A3B8" }}>The Truth Layer of Web3: Decentralized Reputation Infrastructure</p>
          </div>

          <div className="space-y-16" style={{ color: "#F1F5F9", lineHeight: 1.8 }}>
            
            <section id="abstract">
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#3B82F6" }}>1. Abstract</h2>
              <p className="mb-4">
                POWR.PRO is a decentralized reputation protocol designed to solve the Sybil problem in Web3. 
                By combining on-chain transaction history with specialized off-chain data (such as GitHub commits and social reach), 
                POWR.PRO creates a verifiable, unforgeable identity layer. This layer ensures that airdrops, governance rights, 
                and protocol incentives are directed toward genuine builders and users rather than automated bot farms.
              </p>
            </section>

            <section id="problem">
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#3B82F6" }}>2. The Sybil Problem</h2>
              <p className="mb-4">
                Current Web3 incentive structures (airdrops, testnets, retroactive funding) are severely compromised by Sybil attacks. 
                A single operator can launch thousands of wallets, spoofing protocol activity to extract value.
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4" style={{ color: "#94A3B8" }}>
                <li><strong className="text-white">Airdrop Farming:</strong> Dilutes rewards for real users.</li>
                <li><strong className="text-white">Governance Capture:</strong> Threatens the integrity of DAOs.</li>
                <li><strong className="text-white">False Metrics:</strong> Prevents protocols from accurately measuring adoption.</li>
              </ul>
            </section>

            <section id="solution">
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#3B82F6" }}>3. The Solution: Proof of Work & Reputation</h2>
              <p className="mb-4">
                POWR.PRO introduces a multi-dimensional identity framework. Instead of asking "who are you?", we ask "what have you done?".
              </p>
              <p className="mb-4">
                Users link cryptographic wallets and Web2 developer profiles (GitHub). The protocol analyzes 
                the depth and quality of GitHub commits (Proof of Work) alongside on-chain testnet executions (Base, BOB). 
                This creates two core metrics:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="card-static p-5 bg-bg-elevated border-primary/30">
                  <h3 className="font-bold text-white mb-2">1. Reputation Points (REP)</h3>
                  <p className="text-sm">Assigned based on verifiable developer output. High REP signifies a genuine Web3 builder capable of adding protocol value.</p>
                </div>
                <div className="card-static p-5 bg-bg-elevated border-secondary/30">
                  <h3 className="font-bold text-white mb-2">2. Farmer XP</h3>
                  <p className="text-sm">Earned through active, verified participation in testnets, social sharing (Info-Fi), and protocol testing.</p>
                </div>
              </div>
            </section>

            <section id="mechanics">
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#3B82F6" }}>4. Protocol Mechanics</h2>
              <p className="mb-4 font-bold text-white">4.1 Architect Nodes (GitHub Sync)</p>
              <p className="mb-4">
                Connects to the GitHub API. Analyzes PushEvents, code frequency, and repository age to prevent script-generated fake commits. Points dictate the user's Tier (Bronze, Silver, Gold).
              </p>
              <p className="mb-4 font-bold text-white">4.2 Testnet Oracles</p>
              <p className="mb-4">
                Integrated EVM execution. Users use MetaMask to trigger specific contract calls on Base Sepolia and BOB testnets. The protocol verifies execution locally and records it immutably via Supabase RPCs, ensuring no double-spending of tasks.
              </p>
              <p className="mb-4 font-bold text-white">4.3 Info-Fi Web Validator</p>
              <p className="mb-4">
                Social presence validation. An AI engine scans provided social URLs, extracting keywords and sentiment to verify the participant is actively contributing to the narrative, rather than spamming.
              </p>
            </section>

            <section id="roadmap">
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#3B82F6" }}>5. Roadmap</h2>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 text-primary font-bold text-xs">V1</div>
                  <div><strong className="text-white block">Genesis (Current)</strong> Identity aggregation, GitHub integration, Centralized Leaderboard.</div>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30 text-secondary font-bold text-xs">V2</div>
                  <div><strong className="text-white block">Execution Layer</strong> Testnet auto-validation, AI Info-Fi integration, direct EVM interactions.</div>
                </li>
                <li className="flex gap-4 items-start opacity-60">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 text-white font-bold text-xs">V3</div>
                  <div><strong className="text-white block">Decentralization</strong> Moving identity proofs to an L2 rollup, launching $POWR governance token.</div>
                </li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
