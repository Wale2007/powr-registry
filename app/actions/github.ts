"use server";

import { createServerSupabase } from "@/lib/supabase-server";
import { Octokit } from "octokit";

const octokit = new Octokit();

// ────────────────────────────────────────────────────
// 1. GitHub Sync — Fetch commits and calculate tier
// ────────────────────────────────────────────────────
export async function getCommitCount(username: string) {
  try {
    const response = await octokit.request("GET /users/{username}/events", {
      username,
      per_page: 100,
    });

    const pushEvents = response.data.filter(
      (event: any) => event.type === "PushEvent"
    );

    // Sum actual commit count from each PushEvent payload
    const commitCount = pushEvents.reduce((sum: number, event: any) => {
      return sum + (event.payload?.commits?.length || 0);
    }, 0);

    let rank = "bronze";
    if (commitCount > 20) rank = "gold";
    else if (commitCount > 5) rank = "silver";

    return { commitCount, rank, success: true };
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return { commitCount: 0, rank: "bronze", success: false };
  }
}

// ────────────────────────────────────────────────────
// 2. Update Reputation — Upsert profile by user ID
// ────────────────────────────────────────────────────
export async function updateReputation(
  userId: string,
  username: string,
  count: number,
  rank: string
) {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase
      .from("profiles")
      .update({
        github_username: username,
        reputation_points: count,
        role: rank.toLowerCase(),
      })
      .eq("id", userId);

    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ────────────────────────────────────────────────────
// 3. Daily Check-In — 24hr cooldown, streak, +10 XP
// ────────────────────────────────────────────────────
export async function dailyCheckIn(userId: string) {
  try {
    const supabase = createServerSupabase();
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("last_check_in, daily_streak, farmer_xp")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      return { success: false, message: "Profile not found." };
    }

    const now = new Date();
    const lastCheck = profile.last_check_in
      ? new Date(profile.last_check_in)
      : null;

    // Enforce 24-hour cooldown
    if (lastCheck && now.getTime() - lastCheck.getTime() < 24 * 60 * 60 * 1000) {
      const nextAvailable = new Date(lastCheck.getTime() + 24 * 60 * 60 * 1000);
      return {
        success: false,
        message: `Already checked in! Next check-in available at ${nextAvailable.toLocaleTimeString()}.`,
      };
    }

    // If within 48hrs of last check-in, increment streak; otherwise reset to 1
    const newStreak =
      lastCheck && now.getTime() - lastCheck.getTime() < 48 * 60 * 60 * 1000
        ? (profile.daily_streak || 0) + 1
        : 1;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        last_check_in: now.toISOString(),
        daily_streak: newStreak,
        farmer_xp: (profile.farmer_xp || 0) + 10,
      })
      .eq("id", userId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return {
      success: true,
      streak: newStreak,
      xp: (profile.farmer_xp || 0) + 10,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ────────────────────────────────────────────────────
// 4. Info-Fi — Verify social content URL and award XP
// ────────────────────────────────────────────────────
export async function verifyContent(userId: string, postUrl: string) {
  try {
    const url = postUrl.trim();

    // Validate URL matches known Web3 social platforms
    const validPatterns = [
      /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/i,
      /^https?:\/\/(www\.)?lens\.xyz\/.+/i,
      /^https?:\/\/hey\.xyz\/.+/i,
      /^https?:\/\/(www\.)?farcaster\.xyz\/.+/i,
      /^https?:\/\/warpcast\.com\/.+/i,
    ];

    const isValid = validPatterns.some((pattern) => pattern.test(url));
    if (!isValid) {
      return {
        success: false,
        message:
          "Invalid URL. Please provide a valid post link from X (Twitter), Lens, Hey, or Warpcast.",
      };
    }

    // Award 15 XP for valid content
    const supabase = createServerSupabase();
    const { data: profile } = await supabase
      .from("profiles")
      .select("farmer_xp")
      .eq("id", userId)
      .single();

    const currentXp = profile?.farmer_xp || 0;

    const { error } = await supabase
      .from("profiles")
      .update({ farmer_xp: currentXp + 15 })
      .eq("id", userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: "Content verified! +15 XP awarded.",
      xp: currentXp + 15,
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ────────────────────────────────────────────────────
// 5. Claim Task — Anti-cheat TX hash submission
// ────────────────────────────────────────────────────
export async function claimTask(
  userId: string,
  taskKey: string,
  txHash: string,
  xp: number
) {
  try {
    const hash = txHash.trim();

    // Basic TX hash validation (Ethereum-style)
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      return {
        success: false,
        message: "Invalid transaction hash. Must be a valid 0x-prefixed hex string.",
      };
    }

    const supabase = createServerSupabase();

    // Use the claim_task_xp RPC for atomic insert + XP increment
    const { error } = await supabase.rpc("claim_task_xp", {
      p_user_id: userId,
      p_task_key: taskKey,
      p_tx_hash: hash,
      p_xp: xp,
    });

    if (error) {
      // Handle duplicate constraint
      if (error.code === "23505") {
        return {
          success: false,
          message: "You have already completed this task or this TX hash has been used.",
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: `Quest complete! +${xp} XP earned.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}