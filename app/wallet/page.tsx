"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";
import AnimatedBackground from "@/app/components/AnimatedBackground";
import {
  CHAINS, ChainId, saveMnemonic, loadMnemonic, createNewMnemonic,
  deriveAllAddresses, fetchAllBalances, fetchPrices, sendEVMTransaction
} from "@/app/lib/wallet";
import { mnemonicToAccount } from "viem/accounts";

type Tab = "portfolio" | "send" | "receive" | "swap";
type TxStatus = "idle" | "pending" | "success" | "error";

const CHAIN_ORDER: ChainId[] = ["ethereum", "bsc", "base", "solana", "bitcoin", "tron"];
const POPULAR_TOKENS = [
  { symbol: "ETH", name: "Ethereum", chain: "ethereum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png" },
  { symbol: "BNB", name: "BNB", chain: "bsc", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png" },
  { symbol: "SOL", name: "Solana", chain: "solana", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png" },
  { symbol: "BTC", name: "Bitcoin", chain: "bitcoin", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png" },
  { symbol: "TRX", name: "Tron", chain: "tron", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png" },
  { symbol: "USDT", name: "Tether", chain: "ethereum", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },
  { symbol: "USDC", name: "USD Coin", chain: "base", logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets/0x833589fCD6aDC687292394f15601E13D5cC329f5/logo.png" },
];

export default function WalletPage() {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Record<ChainId, string> | null>(null);
  const [balances, setBalances] = useState<Record<ChainId, string> | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [activeChain, setActiveChain] = useState<ChainId>("ethereum");
  const [activeTab, setActiveTab] = useState<Tab>("portfolio");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");

  // Send state
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");

  const loadWallet = useCallback(async (mn: string) => {
    const addrs = deriveAllAddresses(mn);
    setAddresses(addrs);
    const [bals, priceData] = await Promise.all([
      fetchAllBalances(addrs),
      fetchPrices(),
    ]);
    setBalances(bals);
    setPrices(priceData);
  }, []);

  useEffect(() => {
    const saved = loadMnemonic();
    if (saved) {
      setMnemonic(saved);
      loadWallet(saved);
    }
  }, [loadWallet]);

  const handleCreateWallet = async () => {
    setGenerating(true);
    const mn = createNewMnemonic();
    saveMnemonic(mn);
    const addrs = deriveAllAddresses(mn);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from("profiles").update({ wallet_address: addrs.ethereum }).eq("id", session.user.id);
    }
    setMnemonic(mn);
    await loadWallet(mn);
    setGenerating(false);
  };

  const handleRefresh = async () => {
    if (!mnemonic) return;
    setRefreshing(true);
    await loadWallet(mnemonic);
    setRefreshing(false);
  };

  const handleSend = async () => {
    if (!mnemonic || !sendTo || !sendAmount) return;
    setTxStatus("pending");
    setTxError("");
    setTxHash("");
    try {
      const evmChains = ["ethereum", "bsc", "base"] as const;
      if (!evmChains.includes(activeChain as any)) {
        throw new Error(`Direct sending on ${CHAINS[activeChain].name} is not yet enabled via this interface. Please use a native ${CHAINS[activeChain].name} client.`);
      }
      const hash = await sendEVMTransaction({
        mnemonic,
        chainId: activeChain as "ethereum" | "bsc" | "base",
        to: sendTo,
        amountEth: sendAmount,
      });
      setTxHash(hash);
      setTxStatus("success");
      // Refresh balance after success
      setTimeout(handleRefresh, 5000);
    } catch (e: any) {
      setTxError(e.shortMessage || e.message || "Transaction failed");
      setTxStatus("error");
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalUSD = balances && prices
    ? CHAIN_ORDER.reduce((sum, chainId) => {
        const balRaw = balances[chainId] || "0";
        const bal = parseFloat(balRaw);
        const validBal = isNaN(bal) ? 0 : bal;
        const price = prices[chainId] ?? 0;
        return sum + validBal * price;
      }, 0)
    : 0;

  const currentBalance = balances?.[activeChain] ?? "0.000000";
  const currentBalanceUSD = parseFloat(currentBalance) * (prices[activeChain] ?? 0);
  const currentAddress = addresses?.[activeChain] ?? "";
  const chain = CHAINS[activeChain];

  // ─── Setup Screen ────────────────────────────────────────────────────────────
  if (!mnemonic) {
    return (
      <div className="min-h-screen" style={{ background: "#0B1120" }}>
        <AnimatedBackground />
        <Navbar />
        <div className="relative z-10 max-w-md mx-auto px-6 py-24 flex flex-col items-center animate-fade-up">
          <div className="w-24 h-24 rounded-2xl mb-8 flex items-center justify-center overflow-hidden"
            style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>
            <img src="/powr_logo.png" alt="POWR" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-black text-center mb-3">POWR Wallet</h1>
          <p className="text-center text-sm mb-10" style={{ color: "#94A3B8" }}>
            A non-custodial multi-chain wallet secured by your private seed phrase. Your keys, your crypto.
          </p>
          <button onClick={handleCreateWallet} disabled={generating} className="btn-primary w-full h-14 text-base font-bold">
            {generating ? <div className="spinner mx-auto" /> : "Create New Wallet"}
          </button>
          <p className="text-xs text-center mt-4" style={{ color: "#475569" }}>
            Your seed phrase is encrypted and stored only on this device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0B1120" }}>
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6">

        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#64748B" }}>POWR WALLET</p>
            <h1 className="text-2xl font-black">Portfolio</h1>
          </div>
          <button onClick={handleRefresh} disabled={refreshing}
            className="btn-ghost text-xs flex items-center gap-2">
            <span className={refreshing ? "animate-spin" : ""}>↻</span>
            {refreshing ? "Syncing..." : "Refresh"}
          </button>
        </div>

        {/* ─── Total Balance Card ─────────────────────────────────────── */}
        <div className="rounded-2xl p-6 mb-6"
          style={{ background: "linear-gradient(135deg, #0D1E3C 0%, #1a0d3c 100%)", border: "1px solid #1E2D4A" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#64748B" }}>TOTAL BALANCE</p>
          <h2 className="text-4xl font-black text-white mb-0">${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        {/* ─── Chain Selector ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {CHAIN_ORDER.map((cid) => {
            const c = CHAINS[cid];
            const bal = balances?.[cid] ?? "...";
            const isActive = activeChain === cid;
            return (
              <button key={cid} onClick={() => setActiveChain(cid)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                style={{
                  background: isActive ? `${c.color}18` : "#0D1526",
                  border: `1px solid ${isActive ? c.color : "#1E2D4A"}`,
                }}>
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 mb-1">
                  <img src={(c as any).logo} alt={c.symbol} className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-bold text-white">{c.symbol}</span>
                <span className="text-xs font-mono" style={{ color: "#64748B" }}>
                  {(() => {
                    const b = parseFloat(bal || "0");
                    return isNaN(b) ? "0.0000" : b.toFixed(4);
                  })()}
                </span>
              </button>
            );
          })}
        </div>

        {/* ─── Active Chain Detail ────────────────────────────────────── */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                <img src={(chain as any).logo} alt={chain.symbol} className="w-7 h-7 object-contain" />
              </div>
              <div>
                <p className="font-bold text-white">{chain.name}</p>
                <p className="text-xs" style={{ color: "#64748B" }}>{chain.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-white text-lg">
                {(() => {
                  const b = parseFloat(currentBalance);
                  return isNaN(b) ? "0.000000" : b.toFixed(6);
                })()}
              </p>
              <p className="text-xs" style={{ color: "#64748B" }}>${currentBalanceUSD.toFixed(2)}</p>
            </div>
          </div>

          {/* Address bar */}
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: chain.color }}></div>
            <p className="font-mono text-xs flex-1 truncate" style={{ color: "#94A3B8" }}>{currentAddress}</p>
            <button onClick={() => copy(currentAddress)} className="text-xs px-3 py-1 rounded-lg font-semibold"
              style={{ background: `${chain.color}20`, color: chain.color }}>
              {copied ? "✓" : "Copy"}
            </button>
          </div>
        </div>

        {/* ─── Action Tabs ────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          {(["portfolio", "send", "receive", "swap"] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl capitalize"
              style={{
                background: activeTab === tab ? "#3B82F6" : "#0D1526",
                color: activeTab === tab ? "white" : "#64748B",
                border: "1px solid #1E2D4A",
              }}>
              {tab === "portfolio" ? "Assets" : tab === "send" ? "Send" : tab === "receive" ? "Receive" : "Swap"}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ────────────────────────────────────────────── */}
        <div className="rounded-2xl p-6" style={{ background: "#0D1526", border: "1px solid #1E2D4A" }}>

          {/* PORTFOLIO */}
          {activeTab === "portfolio" && (
            <div className="animate-fade-up">
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-white">Your Assets</p>
                <button onClick={() => setRevealed(!revealed)} className="text-xs px-3 py-1 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {revealed ? "Hide Seed" : "Backup Phrase"}
                </button>
              </div>

              <div className="space-y-3">
                {CHAIN_ORDER.map(cid => {
                  const c = CHAINS[cid];
                  const bal = parseFloat(balances?.[cid] ?? "0");
                  const usd = bal * (prices[cid] ?? 0);
                  return (
                    <div key={cid} onClick={() => { setActiveChain(cid); setActiveTab("send"); }}
                      className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:opacity-80"
                      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #1E2D4A" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                          <img src={(c as any).logo} alt={c.symbol} className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{c.symbol}</p>
                          <p className="text-xs" style={{ color: "#64748B" }}>{c.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-white text-sm">{bal.toFixed(6)}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>${usd.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {revealed && (
                <div className="mt-6 p-5 rounded-xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-xs font-bold text-red-400 mb-3 flex items-center gap-2">⚠️ NEVER share this with anyone</p>
                  <div className="grid grid-cols-3 gap-2">
                    {mnemonic.split(" ").map((word, i) => (
                      <div key={i} className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.3)" }}>
                        <span className="text-xs" style={{ color: "#475569" }}>{i + 1}</span>
                        <span className="text-xs font-bold text-white font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEND */}
          {activeTab === "send" && (
            <div className="animate-fade-up flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                  <img src={(chain as any).logo} alt={chain.symbol} className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Sending {chain.symbol}</p>
                  <p className="text-xs" style={{ color: "#64748B" }}>Balance: {currentBalance}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: "#94A3B8" }}>RECIPIENT ADDRESS</label>
                <input type="text" value={sendTo} onChange={e => setSendTo(e.target.value)}
                  placeholder={activeChain === "bitcoin" ? "bc1q..." : activeChain === "solana" ? "Sol..." : activeChain === "tron" ? "T..." : "0x..."}
                  className="input font-mono text-sm w-full" />
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: "#94A3B8" }}>AMOUNT ({chain.symbol})</label>
                <div className="flex gap-2">
                  <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)}
                    placeholder="0.00" className="input font-mono text-sm flex-1" />
                  <button onClick={() => setSendAmount(currentBalance)}
                    className="px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: `${chain.color}20`, color: chain.color, border: `1px solid ${chain.color}30` }}>
                    MAX
                  </button>
                </div>
                {sendAmount && <p className="text-xs mt-1" style={{ color: "#64748B" }}>
                  ≈ ${(parseFloat(sendAmount || "0") * (prices[activeChain] ?? 0)).toFixed(2)} USD
                </p>}
              </div>

              {txStatus === "success" && (
                <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <p className="text-sm font-bold text-green-400 mb-1">✅ Transaction Sent!</p>
                  <a href={`${chain.explorer}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs break-all" style={{ color: "#3B82F6" }}>
                    {txHash}
                  </a>
                </div>
              )}
              {txStatus === "error" && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-xs text-red-400">{txError}</p>
                </div>
              )}

              <button onClick={handleSend} disabled={txStatus === "pending" || !sendTo || !sendAmount}
                className="btn-primary py-4 text-base font-bold mt-2">
                {txStatus === "pending" ? <div className="spinner mx-auto" /> : `Send ${chain.symbol}`}
              </button>
            </div>
          )}

          {/* RECEIVE */}
          {activeTab === "receive" && (
            <div className="animate-fade-up flex flex-col items-center gap-6">
              <div>
                <p className="text-center font-bold text-white mb-1">Receive {chain.symbol}</p>
                <p className="text-center text-xs" style={{ color: "#64748B" }}>on {chain.name}</p>
              </div>
              <div className="p-4 bg-white rounded-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${currentAddress}`}
                  alt="QR Code" width={220} height={220} />
              </div>
              <div className="w-full p-4 rounded-xl flex items-center gap-3" style={{ background: "rgba(0,0,0,0.4)" }}>
                <p className="font-mono text-xs flex-1 break-all" style={{ color: "#94A3B8" }}>{currentAddress}</p>
                <button onClick={() => copy(currentAddress)} className="btn-secondary text-xs shrink-0">
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-center" style={{ color: "#475569" }}>
                Only send {chain.symbol} to this address on {chain.name}
              </p>
            </div>
          )}

          {/* SWAP */}
          {activeTab === "swap" && (
            <div className="animate-fade-up flex flex-col gap-4">
              <p className="font-bold text-white">Token Swap</p>

              <div>
                <label className="text-xs font-bold mb-1.5 block" style={{ color: "#94A3B8" }}>SEARCH TOKEN TO BUY</label>
                <input type="text" value={tokenSearch} onChange={e => setTokenSearch(e.target.value)}
                  placeholder="Name, symbol, or contract address..." className="input text-sm w-full" />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {POPULAR_TOKENS.filter(t =>
                  !tokenSearch || t.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) || t.name.toLowerCase().includes(tokenSearch.toLowerCase())
                ).map(token => (
                  <div key={token.symbol}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:opacity-80 transition-all"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #1E2D4A" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                        <img src={token.logo} alt={token.symbol} className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{token.symbol}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold" style={{ color: "#3B82F6" }}>
                        ${prices[token.chain]?.toLocaleString("en-US", { maximumFractionDigits: 2 }) ?? "—"}
                      </p>
                      <p className="text-xs" style={{ color: "#64748B" }}>{token.chain}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}>
                <span className="text-blue-400 text-sm">🔄</span>
                <div>
                  <p className="text-xs font-bold text-white">
                    Route: {activeChain === "solana" ? "Jupiter / Raydium" : activeChain === "bitcoin" ? "Thorchain" : "Uniswap / 1inch"}
                  </p>
                  <p className="text-xs" style={{ color: "#64748B" }}>Best price aggregated automatically</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input type="number" placeholder="Amount" className="input text-sm flex-1" />
                <button className="btn-primary px-6 font-bold">Swap</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
