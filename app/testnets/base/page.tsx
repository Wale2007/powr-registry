"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconCheck, IconExternalLink, IconSend } from "@/app/components/SvgIcons";
import { loadMnemonic, deriveAllAddresses, sendEVMTransaction } from "@/app/lib/wallet";
import { createWalletClient, createPublicClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

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

  // Check wallet is ready
  const getInternalWallet = () => {
    const mn = loadMnemonic();
    if (!mn) {
      alert("POWR Wallet not initialized! Visit the Wallet tab to generate your keys.");
      return null;
    }
    return mn;
  };

  const addNetwork = async () => {
    const mn = getInternalWallet();
    if (!mn) { setTaskState("addNetwork", "error", "No wallet found!"); return; }
    setTaskState("addNetwork", "pending");
    try {
      const addrs = deriveAllAddresses(mn);
      setTaskState("addNetwork", "done", `Base Sepolia synced! Address: ${addrs.base.slice(0,16)}... +20 XP`);
      await claimXP("addNetwork", 20);
    } catch (e: any) {
      setTaskState("addNetwork", "error", e.message);
    }
  };

  const sendTransaction = async () => {
    const mn = getInternalWallet();
    if (!mn) { setTaskState("sendTx", "error", "No wallet found!"); return; }
    setTaskState("sendTx", "pending");
    try {
      const account = mnemonicToAccount(mn);
      const walletClient = createWalletClient({
        account, chain: baseSepolia, transport: http("https://sepolia.base.org"),
      });
      const hash = await walletClient.sendTransaction({
        to: "0x000000000000000000000000000000000000dEaD",
        value: BigInt("100000000000000"), // 0.0001 ETH
      });
      await claimXP("sendTx", 30);
      setTaskState("sendTx", "done", `TX: ${hash.slice(0, 20)}... +30 XP`);
    } catch (e: any) {
      setTaskState("sendTx", "error", e.shortMessage || e.message || "Transaction failed");
    }
  };

  const interactContract = async () => {
    const mn = getInternalWallet();
    if (!mn) { setTaskState("interactContract", "error", "No wallet found!"); return; }
    setTaskState("interactContract", "pending");
    try {
      const account = mnemonicToAccount(mn);
      const walletClient = createWalletClient({
        account, chain: baseSepolia, transport: http("https://sepolia.base.org"),
      });
      const hash = await walletClient.sendTransaction({
        to: account.address,
        value: BigInt(0),
        data: "0x",
      });
      await claimXP("interactContract", 30);
      setTaskState("interactContract", "done", `Self-TX: ${hash.slice(0, 20)}... +30 XP`);
    } catch (e: any) {
      setTaskState("interactContract", "error", e.shortMessage || e.message || "Failed");
    }
  };

  const swapTransaction = async () => {
    const mn = getInternalWallet();
    if (!mn) { setTaskState("swapTx", "error", "No wallet found!"); return; }
    setTaskState("swapTx", "pending");
    try {
      const account = mnemonicToAccount(mn);
      const walletClient = createWalletClient({
        account, chain: baseSepolia, transport: http("https://sepolia.base.org"),
      });
      const hash = await walletClient.sendTransaction({
        to: "0x1111111254fb6c44bac0bed2854e76f90643097d" as `0x${string}`,
        value: BigInt("50000000000000"), // 0.00005 ETH to mock aggregator
        data: "0x",
      });
      await claimXP("swapTx", 50);
      setTaskState("swapTx", "done", `Swap TX: ${hash.slice(0, 20)}... +50 XP`);
    } catch (e: any) {
      setTaskState("swapTx", "error", e.shortMessage || e.message || "Failed");
    }
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
