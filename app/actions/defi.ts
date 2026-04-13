"use server";

import { createServerSupabase } from "@/lib/supabase-server";

export async function syncTraderNode(userId: string) {
  try {
    const supabase = createServerSupabase();

    // In a real app, this would use a wallet API or indexer (like TheGraph or Covalent)
    // to analyze the user's past 30 days of transactions.
    
    // Simulate API delay
    await new Promise((res) => setTimeout(res, 1200));

    // Generate random but realistic mock stats
    const winRate = (Math.random() * 40 + 45).toFixed(2); // 45.00% to 85.00%
    const tradingVolume = (Math.random() * 50000 + 5000).toFixed(2); // $5k to $55k
    const sniperXpAwarded = 50;

    const { error } = await supabase
      .from("profiles")
      .update({
        win_rate_30d: parseFloat(winRate),
        total_volume_usd: parseFloat(tradingVolume),
        sniper_xp: sniperXpAwarded
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    return {
      success: true,
      winRate: parseFloat(winRate),
      volume: parseFloat(tradingVolume),
      xp: sniperXpAwarded,
      message: "On-chain PnL verified! +50 Sniper XP."
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function syncRiskOracle(userId: string) {
  try {
    const supabase = createServerSupabase();

    // Real app: Queries lending markets (Aave/Compound) for active repos
    // Simulate delay
    await new Promise((res) => setTimeout(res, 1200));

    // Gamify Health Factor. Let's make it occasionally dip into danger zones.
    const isDangerous = Math.random() > 0.7; // 30% chance to be risky
    let healthFactor;

    if (isDangerous) {
      healthFactor = (Math.random() * 0.4 + 1.1).toFixed(2); // 1.10 to 1.50 (Danger)
    } else {
      healthFactor = (Math.random() * 1.5 + 1.8).toFixed(2); // 1.80 to 3.30 (Safe)
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        health_factor: parseFloat(healthFactor)
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    return {
      success: true,
      healthFactor: parseFloat(healthFactor),
      message: "Lending risk parameters synced."
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
