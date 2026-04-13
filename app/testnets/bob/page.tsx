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

  const checkMetaMask = () => {
    if (!window.ethereum) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      } else {
        alert("MetaMask not detected! Please install the extension.");
      }
      return false;
    }
    return true;
  };

  const addNetwork = async () => {
    if (!checkMetaMask()) { setTaskState("addNetwork", "error", "MetaMask not detected!"); return; }
    setTaskState("addNetwork", "pending");
    try {
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [BOB_SEPOLIA] });
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BOB_SEPOLIA.chainId }] });
      await claimXP("addNetwork", 20);
      setTaskState("addNetwork", "done", "BOB Sepolia added! +20 XP");
    } catch (err: any) {
      setTaskState("addNetwork", "error", err.message || "Failed to add network.");
    }
  };

  const sendTransaction = async () => {
    if (!checkMetaMask()) { setTaskState("sendTx", "error", "MetaMask not detected!"); return; }
    setTaskState("sendTx", "pending");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: "0x000000000000000000000000000000000000dEaD", value: "0x38D7EA4C68000", chainId: BOB_SEPOLIA.chainId }],
      });
      await claimXP("sendTx", 30);
      setTaskState("sendTx", "done", `TX sent! ${txHash.slice(0, 12)}... +30 XP`);
    } catch (err: any) {
      setTaskState("sendTx", "error", err.code === 4001 ? "Transaction rejected." : (err.message || "Failed."));
    }
  };

  const selfTransaction = async () => {
    if (!checkMetaMask()) { setTaskState("selfTx", "error", "MetaMask not detected!"); return; }
    setTaskState("selfTx", "pending");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: accounts[0], value: "0x0", data: "0x", chainId: BOB_SEPOLIA.chainId }],
      });
      await claimXP("selfTx", 30);
      setTaskState("selfTx", "done", `Self-TX complete! ${txHash.slice(0, 12)}... +30 XP`);
    } catch (err: any) {
      setTaskState("selfTx", "error", err.code === 4001 ? "Transaction rejected." : (err.message || "Failed."));
    }
  };

  const bridgeTransaction = async () => {
    if (!checkMetaMask()) { setTaskState("bridgeTx", "error", "MetaMask not detected!"); return; }
    setTaskState("bridgeTx", "pending");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: "0xB0B0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0", value: "0x11C37937E08000", data: "0x", chainId: BOB_SEPOLIA.chainId }],
      });
      await claimXP("bridgeTx", 40);
      setTaskState("bridgeTx", "done", `Bridge mock complete! TX: ${txHash.slice(0, 12)}... +40 XP`);
    } catch (err: any) {
      setTaskState("bridgeTx", "error", err.code === 4001 ? "Transaction rejected." : (err.message || "Failed."));
    }
  };

  const swapTransactionBob = async () => {
    if (!checkMetaMask()) { setTaskState("swapTxBob", "error", "MetaMask not detected!"); return; }
    setTaskState("swapTxBob", "pending");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ from: accounts[0], to: "0x2222222222222222222222222222222222222222", value: "0x5AF3107A4000", data: "0x", chainId: BOB_SEPOLIA.chainId }],
      });
      await claimXP("swapTxBob", 50);
      setTaskState("swapTxBob", "done", `Swap complete! TX: ${txHash.slice(0, 12)}... +50 XP`);
    } catch (err: any) {
      setTaskState("swapTxBob", "error", err.code === 4001 ? "Transaction rejected." : (err.message || "Failed."));
    }
  };

  const TASKS = [
    { key: "addNetwork", title: "Add BOB Sepolia Network", desc: "Add the BOB Sepolia testnet to MetaMask.", xp: 20, action: addNetwork },
    { key: "sendTx", title: "Send Test ETH", desc: "Send 0.001 ETH to a burn address on BOB Sepolia.", xp: 30, action: sendTransaction },
    { key: "selfTx", title: "Execute Self-Transaction", desc: "Send a zero-value transaction to your own address.", xp: 30, action: selfTransaction },
    { key: "bridgeTx", title: "Bridge Tokens via BOB Gateway", desc: "Simulates bridging assets securely into the BOB Network.", xp: 40, action: bridgeTransaction },
    { key: "swapTxBob", title: "Swap Tokens on Layer 2", desc: "Execute a mock swap utilizing BOB's high-speed sequencer.", xp: 50, action: swapTransactionBob },
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
          <h2 className="text-lg font-bold mb-5">Step-by-Step Guide</h2>
          <div className="space-y-5">
            {GUIDE_STEPS.map((step, i) => (
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
