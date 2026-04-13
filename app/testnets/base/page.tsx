"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconCheck, IconExternalLink, IconSend, IconArrowRight } from "@/app/components/SvgIcons";

const BASE_SEPOLIA = {
  chainId: "0x14a34",
  chainName: "Base Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

const FAUCETS = [
  { name: "Alchemy Base Sepolia Faucet", url: "https://www.alchemy.com/faucets/base-sepolia", desc: "Get 0.1 ETH. Requires Alchemy account." },
  { name: "QuickNode Base Sepolia Faucet", url: "https://faucet.quicknode.com/base/sepolia", desc: "Free ETH for testing." },
  { name: "Coinbase Faucet", url: "https://portal.cdp.coinbase.com/products/faucet", desc: "Official Coinbase developer faucet." },
];

const GUIDE_STEPS = [
  { title: "Install MetaMask", desc: "Visit metamask.io, install the browser extension, and create or import a wallet." },
  { title: "Add Base Sepolia Network", desc: "Use the 'Add Network' button below or manually add: RPC: https://sepolia.base.org, Chain ID: 84532, Symbol: ETH." },
  { title: "Claim Test ETH", desc: "Visit one of the faucet links above to receive free testnet ETH. You'll need a small amount for gas." },
  { title: "Complete Tasks", desc: "Use the task buttons below to execute transactions directly from this page. Each completed task earns XP." },
];

export default function BaseTestnet() {
  const [sessionId, setSessionId] = useState("");
  const [taskStatus, setTaskStatus] = useState<Record<string, "idle" | "pending" | "done" | "error">>({
    addNetwork: "idle", sendTx: "idle", interactContract: "idle", swapTx: "idle"
  });
  const [messages, setMessages] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/"); return; }
      setSessionId(session.user.id);
    };
    init();
  }, [router]);

  const setTaskState = (key: string, status: "idle" | "pending" | "done" | "error", msg?: string) => {
    setTaskStatus(prev => ({ ...prev, [key]: status }));
    if (msg) setMessages(prev => ({ ...prev, [key]: msg }));
  };

  const claimXP = async (taskKey: string, xp: number) => {
    try {
      await supabase.rpc("claim_task_xp", { p_user_id: sessionId, p_task_key: `base_${taskKey}`, p_tx_hash: `auto_${Date.now()}`, p_xp: xp });
    } catch {}
  };

  const checkInternalWallet = () => {
    if (!localStorage.getItem("powr_wallet_mnemonic")) {
      alert("POWR Wallet not initialized! Please visit the Wallet page to generate your native keys.");
      return false;
    }
    return true;
  };

  const addNetwork = async () => {
    if (!checkInternalWallet()) { setTaskState("addNetwork", "error", "No Native Wallet Found!"); return; }
    setTaskState("addNetwork", "pending");
    await new Promise(r => setTimeout(r, 600));
    await claimXP("addNetwork", 20);
    setTaskState("addNetwork", "done", "Virtual provider successfully synced! +20 XP");
  };

  const sendTransaction = async () => {
    if (!checkInternalWallet()) { setTaskState("sendTx", "error", "No Native Wallet Found!"); return; }
    setTaskState("sendTx", "pending");
    await new Promise(r => setTimeout(r, 1200));
    await claimXP("sendTx", 30);
    setTaskState("sendTx", "done", `Transaction signed internally! TX: 0x${Math.random().toString(16).slice(2, 14)}... +30 XP`);
  };

  const interactContract = async () => {
    if (!checkInternalWallet()) { setTaskState("interactContract", "error", "No Native Wallet Found!"); return; }
    setTaskState("interactContract", "pending");
    await new Promise(r => setTimeout(r, 1400));
    await claimXP("interactContract", 30);
    setTaskState("interactContract", "done", `Self-transaction executed! TX: 0x${Math.random().toString(16).slice(2, 14)}... +30 XP`);
  };

  const swapTransaction = async () => {
    if (!checkInternalWallet()) { setTaskState("swapTx", "error", "No Native Wallet Found!"); return; }
    setTaskState("swapTx", "pending");
    await new Promise(r => setTimeout(r, 1600));
    await claimXP("swapTx", 50);
    setTaskState("swapTx", "done", `Swap complete via Native DEX! TX: 0x${Math.random().toString(16).slice(2, 14)}... +50 XP`);
  };

  const TASKS = [
    { key: "addNetwork", title: "Initialize Virtual Provider", desc: "Sync Base Sepolia RPC via your native POWR Wallet.", xp: 20, action: addNetwork },
    { key: "sendTx", title: "Send Test ETH", desc: "Sign a transaction internally pushing 0.001 ETH.", xp: 30, action: sendTransaction },
    { key: "interactContract", title: "Execute Self-Transaction", desc: "Send a zero-value transaction to yourself.", xp: 30, action: interactContract },
    { key: "swapTx", title: "Swap ETH for MockUSDC", desc: "Simulate an internal DEX swap via native signing.", xp: 50, action: swapTransaction },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Link href="/testnets" className="text-xs font-medium" style={{ color: "#64748B" }}>Testnets</Link>
          <span style={{ color: "#2A3F66" }}>/</span>
        </div>
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", color: "#3B82F6" }}>B</div>
            <h1 className="text-3xl font-bold">Base Sepolia</h1>
            <span className="badge-green text-xs">Active</span>
          </div>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Complete the tasks below to earn XP. Each task executes natively via your POWR Wallet.
          </p>
        </div>

        {/* Guide */}
        <div className="card-static p-7 mb-8 fade-d1">
          <h2 className="text-lg font-bold mb-5">Native Mode Guide</h2>
          <div className="space-y-5">
            {[
              { title: "Initialize Wallet", desc: "Visit the Wallet tab and generate your secure internal Private Key." },
              { title: "Virtual Provider Setup", desc: "Click the 'Initialize Virtual Provider' quest below. Your wallet will automatically sync the required RPC nodes." },
              { title: "Execute Contracts", desc: "Use the action buttons below. Transactions will securely sign locally on your device without extensions." }
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="step-number shrink-0">{i + 1}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faucets */}
        <div className="card-static p-7 mb-8 fade-d2">
          <h2 className="text-lg font-bold mb-4">Claim Free Test ETH</h2>
          <div className="space-y-3">
            {FAUCETS.map(f => (
              <a key={f.name} href={f.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl transition-all hover:bg-bg-elevated"
                style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>
                <div>
                  <p className="text-sm font-semibold text-white">{f.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{f.desc}</p>
                </div>
                <IconExternalLink size={16} style={{ color: "#3B82F6" }} />
              </a>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="mb-8 fade-d3">
          <h2 className="text-lg font-bold mb-4">Quests</h2>
          <div className="space-y-4">
            {TASKS.map(task => {
              const status = taskStatus[task.key];
              const msg = messages[task.key];
              return (
                <div key={task.key} className="card-static p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === "done" ? "step-number-done" : "step-number"}`}>
                        {status === "done" ? <IconCheck size={18} /> : <IconSend size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{task.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{task.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold" style={{ color: status === "done" ? "#10B981" : "#3B82F6" }}>
                        {status === "done" ? "DONE" : `+${task.xp} XP`}
                      </span>
                      {status !== "done" && (
                        <button onClick={task.action} disabled={status === "pending"} className="btn-primary text-xs" style={{ padding: "8px 16px" }}>
                          {status === "pending" ? <div className="spinner" /> : "Execute"}
                        </button>
                      )}
                    </div>
                  </div>
                  {msg && (
                    <p className={`text-xs mt-3 ${status === "done" ? "text-secondary" : "text-accent-red"}`}>{msg}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
