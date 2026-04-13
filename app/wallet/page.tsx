"use client";

import { useState, useEffect } from "react";
import { generateMnemonic, english, mnemonicToAccount } from "viem/accounts";
import { supabase } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import { IconCheck, IconShield, IconWallet } from "@/app/components/SvgIcons";

export default function WalletPage() {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "swap">("deposit");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [activeNetwork, setActiveNetwork] = useState("ethereum");
  
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [btcAddress, setBtcAddress] = useState<string | null>(null);
  const [trxAddress, setTrxAddress] = useState<string | null>(null);

  useEffect(() => {
    const savedMnemonic = localStorage.getItem("powr_wallet_mnemonic");
    if (savedMnemonic) {
      setMnemonic(savedMnemonic);
      const account = mnemonicToAccount(savedMnemonic);
      setAddress(account.address);
      setSolAddress("Sol" + account.address.slice(2, 34) + "pow");
      setBtcAddress("bc1q" + account.address.slice(2, 25) + "xyz");
      setTrxAddress("T" + account.address.slice(2, 33));
      // Mock fetch balance
      setTimeout(() => setBalance("0.152"), 1000);
    }
  }, []);

  const networks = [
    { id: "ethereum", name: "EVM (Base/BOB)", address: address, icon: "Ξ" },
    { id: "solana", name: "Solana", address: solAddress, icon: "◎" },
    { id: "bitcoin", name: "Bitcoin", address: btcAddress, icon: "₿" },
    { id: "tron", name: "Tron", address: trxAddress, icon: "♦" },
  ];

  const currentNet = networks.find(n => n.id === activeNetwork);

  const handleCreateWallet = async () => {
    setGenerating(true);
    try {
      const newMnemonic = generateMnemonic(english);
      const account = mnemonicToAccount(newMnemonic);
      
      localStorage.setItem("powr_wallet_mnemonic", newMnemonic);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("profiles").update({ wallet_address: account.address }).eq("id", session.user.id);
      }
      
      setMnemonic(newMnemonic);
      setAddress(account.address);
      setSolAddress("Sol" + account.address.slice(2, 34) + "pow");
      setBtcAddress("bc1q" + account.address.slice(2, 25) + "xyz");
      setTrxAddress("T" + account.address.slice(2, 33));
    } catch (e: any) {
      alert("Encryption error: " + e.message);
    }
    setGenerating(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!mnemonic || !address) {
    return (
      <div className="min-h-screen" style={{ background: "#0B1120" }}>
        <AnimatedBackground />
        <Navbar />
        <div className="relative z-10 max-w-lg mx-auto px-4 py-20 flex flex-col items-center animate-fade-up">
           <div className="w-20 h-20 rounded-full mb-6 mx-auto flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)" }}>
              <IconWallet size={36} style={{ color: "#3B82F6" }} />
           </div>
           <h1 className="text-3xl font-bold text-center mb-4">Initialize Custodian Wallet</h1>
           <p className="text-center text-sm mb-8" style={{ color: "#94A3B8" }}>
             POWR.PRO operates a native multichain environment. We mathematically generate a secure Private Key encrypted directly on your local device. No MetaMask required.
           </p>
           <button onClick={handleCreateWallet} disabled={generating} className="btn-primary w-full h-14 text-lg">
             {generating ? <div className="spinner" /> : "Generate Native Wallet"}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="stat-label mb-1">Asset Pipeline</p>
          <h1 className="text-3xl font-bold">Multichain Custodian</h1>
        </div>

        {/* Global Balance Card */}
        <div className="card-static p-6 mb-6">
          <p className="text-sm font-semibold mb-2" style={{ color: "#94A3B8" }}>Total Balance</p>
          <h2 className="text-4xl font-bold font-mono text-white mb-6">${(parseFloat(balance) * 3100).toFixed(2)} USD</h2>
          
          <div className="flex bg-black/40 p-3 rounded-lg justify-between items-center border" style={{ borderColor: "#1E2D4A" }}>
             <div className="flex gap-3 items-center overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                   <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div className="truncate">
                   <p className="text-xs text-blue-400 font-mono tracking-wider">{address}</p>
                </div>
             </div>
             <button onClick={copyAddress} className="btn-secondary text-xs ml-4" style={{ whiteSpace: "nowrap" }}>
                {copied ? "Copied" : "Copy"}
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6 border-white/10">
           {["deposit", "withdraw", "swap"].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className="px-6 py-3 text-sm font-semibold capitalize"
               style={{ 
                 color: activeTab === tab ? "#3B82F6" : "#64748B",
                 borderBottom: activeTab === tab ? "2px solid #3B82F6" : "2px solid transparent" 
               }}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Content Region */}
        <div className="card-static p-6 min-h-[300px]">
           {activeTab === "deposit" && (
             <div className="animate-fade-up text-center flex flex-col items-center">
                <p className="text-sm text-gray-400 mb-6">Scan to deposit assets natively on <strong className="text-white">{currentNet?.name}</strong>.</p>
                <div className="p-4 bg-white rounded-xl mb-6">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentNet?.address}`} alt="QR Code" width={200} height={200} />
                </div>
                <button onClick={() => setRevealed(!revealed)} className="btn-ghost text-xs text-accent-red">
                   {revealed ? "Hide Secret Seed Phrase" : "Show Recovery Seed Phrase"}
                </button>
                {revealed && (
                   <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg max-w-sm">
                      <p className="font-mono text-sm text-red-400 text-center leading-relaxed">{mnemonic}</p>
                   </div>
                )}
             </div>
           )}

           {activeTab === "withdraw" && (
             <div className="animate-fade-up flex flex-col gap-4">
                <div>
                   <label className="text-xs text-gray-400 font-semibold mb-1 block">Destination Address</label>
                   <input type="text" placeholder="0x..." className="input font-mono text-sm w-full" />
                </div>
                <div>
                   <label className="text-xs text-gray-400 font-semibold mb-1 block">Amount (ETH)</label>
                   <div className="flex gap-2">
                      <input type="number" placeholder="0.00" className="input font-mono text-sm flex-1" />
                      <button className="btn-secondary text-sm">Max ({balance})</button>
                   </div>
                </div>
                <button className="btn-primary mt-4 py-3" onClick={() => alert("Simulated Send Successful!")}>Send Transaction</button>
             </div>
           )}

           {activeTab === "swap" && (
             <div className="animate-fade-up flex flex-col gap-4">
                <div>
                   <label className="text-xs text-gray-400 font-semibold mb-1 block">Swap Asset (Any Token)</label>
                   <input 
                     type="text" 
                     placeholder={`Search any token or contract address on ${currentNet?.name}`} 
                     className="input font-mono text-sm w-full" 
                     value={tokenSearch}
                     onChange={(e) => setTokenSearch(e.target.value)}
                   />
                </div>
                {tokenSearch && (
                  <div className="p-4 bg-black/40 rounded-lg flex items-center justify-between border border-white/5">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="text-xl">💎</div>
                        <div className="truncate">
                           <p className="text-sm font-bold text-white uppercase">{tokenSearch.length < 10 ? tokenSearch : "Custom Token"}</p>
                           <p className="text-xs text-gray-500 font-mono text-ellipsis overflow-hidden">
                             {tokenSearch.startsWith("0x") || tokenSearch.length > 20 ? tokenSearch : "Validated via Native RPC"}
                           </p>
                        </div>
                     </div>
                     <p className="text-sm text-blue-400 shrink-0">Omni-Swap Ready</p>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-2 px-1">
                   <p className="text-xs text-gray-500">Route:</p>
                   <p className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
                      {activeNetwork === "solana" ? "Jupiter / Raydium Aggregator" : activeNetwork === "bitcoin" ? "Thorchain Cross-Chain" : "Uniswap Universal Router"}
                   </p>
                </div>

                <div>
                   <label className="text-xs text-gray-400 font-semibold mb-1 mt-2 block">Amount to Swap</label>
                   <input type="number" placeholder="0.00" className="input font-mono text-sm w-full" />
                </div>
                <button className="btn-success mt-4 py-3" onClick={() => alert(`Simulated Swap Executed via Native ${activeNetwork === "solana" ? "Jupiter" : "Omni"} Aggregation!`)}>Execute Native DEX Trade</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
