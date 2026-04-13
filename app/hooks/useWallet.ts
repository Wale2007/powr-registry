"use client";
import { useState, useEffect } from "react";
import {
  loadMnemonic, deriveAllAddresses, ChainId,
  fetchAllBalances, fetchPrices, sendEVMTransaction
} from "@/app/lib/wallet";

/**
 * Global hook that exposes the POWR internal wallet to any page.
 * EVM chains (ethereum, bsc, base) support real transactions.
 */
export const useWallet = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Record<ChainId, string> | null>(null);
  const [balances, setBalances] = useState<Record<ChainId, string> | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mn = loadMnemonic();
    if (mn) {
      setMnemonic(mn);
      const addrs = deriveAllAddresses(mn);
      setAddresses(addrs);
      Promise.all([fetchAllBalances(addrs), fetchPrices()]).then(([bals, ps]) => {
        setBalances(bals);
        setPrices(ps);
        setReady(true);
      });
    } else {
      setReady(true); // no wallet, still ready
    }
  }, []);

  const hasWallet = !!mnemonic;
  const evmAddress = addresses?.ethereum ?? null;
  const evmBalance = balances?.ethereum ?? "0";

  const send = async (chainId: "ethereum" | "bsc" | "base", to: string, amount: string) => {
    if (!mnemonic) throw new Error("No wallet initialized");
    return sendEVMTransaction({ mnemonic, chainId, to, amountEth: amount });
  };

  return { mnemonic, addresses, balances, prices, ready, hasWallet, evmAddress, evmBalance, send };
};