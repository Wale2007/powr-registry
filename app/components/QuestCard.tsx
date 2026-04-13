"use client";

import { useState } from "react";
import { claimTask } from "@/app/actions/github";

const QUESTS = [
  { key: "monad_swap", name: "Monad Swap", xp: 50, icon: "🔄", description: "Execute a token swap on Monad testnet" },
  { key: "akash_deploy", name: "Akash Deploy", xp: 50, icon: "🚀", description: "Deploy a container on Akash Network" },
  { key: "berachain_mint", name: "Berachain Mint", xp: 50, icon: "🐻", description: "Mint an NFT on Berachain" },
];

export default function QuestCard({ userId }: { userId: string }) {
  const [activeQuest, setActiveQuest] = useState<string | null>(null);
  const [txHash, setTxHash] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  const handleSubmit = async (quest: typeof QUESTS[0]) => {
    if (!txHash.trim()) {
      setMessage({ text: "Please enter a transaction hash.", isError: true });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const result = await claimTask(userId, quest.key, txHash, quest.xp);
    if (result.success) {
      setCompletedQuests((prev) => new Set(prev).add(quest.key));
      setActiveQuest(null);
      setTxHash("");
    }
    setMessage({ text: result.message, isError: !result.success });
    setSubmitting(false);
  };

  return (
    <div>
      <p className="stat-label mb-3 ml-1">Active Quests</p>
      <div className="space-y-3">
        {QUESTS.map((quest, i) => {
          const isCompleted = completedQuests.has(quest.key);
          return (
            <div key={quest.key} className={`fade-stagger-${i + 2}`}>
              <button
                onClick={() => {
                  if (!isCompleted) {
                    setActiveQuest(activeQuest === quest.key ? null : quest.key);
                    setMessage(null);
                    setTxHash("");
                  }
                }}
                disabled={isCompleted}
                className="w-full text-left card rounded-2xl p-5 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: "rgba(138,43,226,0.1)", border: "1px solid rgba(138,43,226,0.15)" }}>
                    {quest.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {isCompleted && <span className="text-accent-emerald mr-1">✓</span>}
                      {quest.name}
                    </p>
                    <p className="text-xs" style={{ color: "#606078" }}>{quest.description}</p>
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: isCompleted ? "#34D399" : "#00F0FF" }}>
                  {isCompleted ? "DONE" : `+${quest.xp} XP`}
                </span>
              </button>

              {activeQuest === quest.key && (
                <div className="mt-2 rounded-xl p-5 animate-fade-up"
                  style={{ background: "#0a0a0f", border: "1px solid #2a2a3a" }}>
                  <p className="text-xs mb-3" style={{ color: "#9090a8" }}>
                    Paste your transaction hash to verify completion:
                  </p>
                  <input
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="input mb-3 font-mono text-xs"
                  />
                  {message && (
                    <p className={`text-xs mb-3 ${message.isError ? "text-red-400" : "text-accent-emerald"}`}>
                      {message.text}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmit(quest)}
                      disabled={submitting}
                      className="btn-primary flex-1 disabled:opacity-50 text-sm"
                      style={{ padding: "10px 20px" }}>
                      {submitting ? "Verifying..." : "Submit Proof"}
                    </button>
                    <button
                      onClick={() => { setActiveQuest(null); setMessage(null); }}
                      className="btn-ghost text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
