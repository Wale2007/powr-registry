"use client";

import { useState } from "react";
import { getCommitCount, updateReputation } from "@/app/actions/github";

export default function GitHubSyncCard({
  userId,
  username,
  initialReputation,
  initialRole,
}: {
  userId: string;
  username: string;
  initialReputation: number;
  initialRole: string;
}) {
  const [syncing, setSyncing] = useState(false);
  const [commits, setCommits] = useState(initialReputation);
  const [role, setRole] = useState(initialRole || "bronze");
  const [synced, setSynced] = useState(false);

  const handleSync = async () => {
    if (!username) return;
    setSyncing(true);
    const result = await getCommitCount(username);
    if (result.success) {
      await updateReputation(userId, username, result.commitCount, result.rank);
      setCommits(result.commitCount);
      setRole(result.rank);
      setSynced(true);
    }
    setSyncing(false);
  };

  return (
    <div className="card rounded-2xl p-6 fade-stagger-1">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="stat-label mb-1">Architect Node</p>
          <h3 className="text-lg font-bold text-white">GitHub Activity</h3>
        </div>
        <span className={`badge badge-${role}`}>{role}</span>
      </div>

      <div className="flex items-end gap-8 mb-6">
        <div>
          <p className="stat-label">Commits</p>
          <p className="text-4xl font-black text-accent-cyan">{commits}</p>
        </div>
        <div>
          <p className="stat-label">Tier</p>
          <p className="text-lg font-bold text-white capitalize">{role}</p>
        </div>
      </div>

      <button
        onClick={handleSync}
        disabled={syncing}
        className={synced ? "btn-secondary w-full" : "btn-primary w-full"}
        style={{ height: "46px", fontSize: "14px" }}>
        {syncing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="spinner" /> Syncing...
          </span>
        ) : synced ? (
          "✓ Synced Successfully"
        ) : (
          "Sync GitHub Activity"
        )}
      </button>
    </div>
  );
}
