"use client";

import { useState } from "react";
import { dailyCheckIn } from "@/app/actions/github";

export default function DailyCheckInCard({
  userId,
  initialStreak,
  initialXp,
}: {
  userId: string;
  initialStreak: number;
  initialXp: number;
}) {
  const [streak, setStreak] = useState(initialStreak);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage(null);
    const result = await dailyCheckIn(userId);
    if (result.success) {
      setStreak(result.streak || 0);
      setChecked(true);
      setMessage("Check-in successful! +10 XP");
    } else {
      setMessage(result.message || "Check-in failed.");
    }
    setLoading(false);
  };

  return (
    <div className="card rounded-2xl p-6 fade-stagger-3">
      <p className="stat-label mb-3">Daily Check-In</p>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(239,68,68,0.1))", border: "1px solid rgba(251,191,36,0.15)" }}>
          🔥
        </div>
        <div>
          <p className="text-3xl font-black text-white">{streak}</p>
          <p className="stat-label">Day Streak</p>
        </div>
      </div>

      {message && (
        <p className={`text-xs mb-3 ${checked ? "text-accent-emerald" : "text-accent-amber"}`}>
          {message}
        </p>
      )}

      <button
        onClick={handleCheckIn}
        disabled={loading || checked}
        className={`w-full text-sm font-semibold flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
          checked ? "btn-secondary" : "btn-primary"
        }`}
        style={{ height: "44px", opacity: loading ? 0.6 : 1 }}>
        {loading ? (
          <><div className="spinner" /> Checking in...</>
        ) : checked ? (
          "✓ Checked In Today"
        ) : (
          "Check In (+10 XP)"
        )}
      </button>
    </div>
  );
}
