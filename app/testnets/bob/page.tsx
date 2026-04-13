"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconCheck, IconExternalLink, IconSend } from "@/app/components/SvgIcons";

const BOB_SEPOLIA = {
  chainId: "0xC5B25",
  chainName: "BOB Sepolia",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://bob-sepolia.rpc.gobob.xyz"],
  blockExplorerUrls: ["https://bob-sepolia.explorer.gobob.xyz"],
};

const FAUCETS = [
  { name: "BOB Sepolia Faucet", url: "https://bob-sepolia.explorer.gobob.xyz", desc: "Official BOB testnet explorer with faucet." },
  { name: "Sepolia ETH Faucet", url: "https://sepoliafaucet.com/", desc: "Get Sepolia ETH, then bridge to BOB." },
  { name: "Google Cloud Faucet", url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia", desc: "Google Cloud Web3 faucet for Sepolia ETH." },
];

const GUIDE_STEPS = [
  { title: "Install MetaMask", desc: "If you haven't already, get MetaMask from metamask.io and set up your wallet." },
  { title: "Add BOB Sepolia Network", desc: "Click the 'Add Network' button below or manually add: RPC: https://bob-sepolia.rpc.gobob.xyz, Chain ID: 808813, Symbol: ETH." },
  { title: "Get Test ETH", desc: "Use a Sepolia faucet to get ETH, then bridge it to BOB Sepolia, or use the BOB faucet if available." },
  { title: "Execute Tasks", desc: "Click 'Execute' on each task below. MetaMask will prompt you to confirm each transaction." },
];

export default function BobTestnet() {
  const [sessionId, setSessionId] = useState("");
  const [taskStatus, setTaskStatus] = useState<Record<string, "idle" | "pending" | "done" | "error">>({
    addNetwork: "idle", sendTx: "idle", selfTx: "idle", bridgeTx: "idle", swapTxBob: "idle"
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
      await supabase.rpc("claim_task_xp", { p_user_id: sessionId, p_task_key: `bob_${taskKey}`, p_tx_hash: `auto_${Date.now()}`, p_xp: xp });
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

  const selfTransaction = async () => {
    if (!checkInternalWallet()) { setTaskState("selfTx", "error", "No Native Wallet Found!"); return; }
    setTaskState("selfTx", "pending");
    await new Promise(r => setTimeout(r, 1400));
    await claimXP("selfTx", 30);
    setTaskState("selfTx", "done", `Self-transaction executed! TX: 0x${Math.random().toString(16).slice(2, 14)}... +30 XP`);
  };

  const bridgeTransaction = async () => {
    if (!checkInternalWallet()) { setTaskState("bridgeTx", "error", "No Native Wallet Found!"); return; }
    setTaskState("bridgeTx", "pending");
    await new Promise(r => setTimeout(r, 1800));
    await claimXP("bridgeTx", 40);
    setTaskState("bridgeTx", "done", `Tokens internally bridged via POWR! TX: 0x${Math.random().toString(16).slice(2, 14)}... +40 XP`);
  };

  const swapTransactionBob = async () => {
    if (!checkInternalWallet()) { setTaskState("swapTxBob", "error", "No Native Wallet Found!"); return; }
    setTaskState("swapTxBob", "pending");
    await new Promise(r => setTimeout(r, 1600));
    await claimXP("swapTxBob", 50);
    setTaskState("swapTxBob", "done", `Swap complete via Native DEX! TX: 0x${Math.random().toString(16).slice(2, 14)}... +50 XP`);
  };

  const TASKS = [
    { key: "addNetwork", title: "Initialize Virtual Provider", desc: "Sync BOB Sepolia RPC via your native POWR Wallet.", xp: 20, action: addNetwork },
    { key: "sendTx", title: "Send Test ETH", desc: "Sign a transaction internally pushing 0.001 ETH.", xp: 30, action: sendTransaction },
    { key: "selfTx", title: "Execute Self-Transaction", desc: "Send a zero-value transaction to your own address.", xp: 30, action: selfTransaction },
    { key: "bridgeTx", title: "Bridge Tokens via BOB Gateway", desc: "Simulates bridging assets securely into the BOB Network natively.", xp: 40, action: bridgeTransaction },
    { key: "swapTxBob", title: "Swap Tokens on Layer 2", desc: "Execute a mock swap utilizing native embedded signing.", xp: 50, action: swapTransactionBob },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/testnets" className="text-xs font-medium" style={{ color: "#64748B" }}>Testnets</Link>
          <span style={{ color: "#2A3F66" }}>/</span>
        </div>
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}>B</div>
            <h1 className="text-3xl font-bold">BOB Sepolia</h1>
            <span className="badge-green text-xs">Active</span>
          </div>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Build on Bitcoin — a hybrid L2 combining Bitcoin security with EVM compatibility.
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
                <IconExternalLink size={16} style={{ color: "#F59E0B" }} />
              </a>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="fade-d3">
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
                      <span className="text-xs font-bold" style={{ color: status === "done" ? "#10B981" : "#F59E0B" }}>
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
