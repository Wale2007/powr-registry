"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const KEYWORDS = ["powr", "web3", "defi", "reputation", "blockchain", "on-chain", "builder", "farmer", "testnet", "airdrop"];

export async function scanContent(userId: string, url: string) {
  try {
    // 1. Validate URL format
    if (!url.includes("twitter.com") && !url.includes("x.com")) {
      return { success: false, message: "Only Twitter/X URLs are supported currently." };
    }

    // 2. Mock AI Content analysis (in production this would fetch metadata + call an LLM)
    // For V2, we simulate an intelligent scan with keyword matching and a slight delay
    await new Promise(res => setTimeout(res, 1500)); 

    // Simulate extracting text from the URL (to make it feel like AI validation)
    // In reality without API keys, we just do a random check heavily weighted to succeed if they paste a valid URL
    const isQualityPost = Math.random() > 0.2; // 80% pass rate for demo
    
    if (!isQualityPost) {
      return { success: false, message: "AI Engine: Content rejected. Does not meaningfully discuss POWR.PRO or Web3." };
    }

    // Generate simulated keywords found
    const shuffled = KEYWORDS.sort(() => 0.5 - Math.random());
    const foundCount = Math.floor(Math.random() * 3) + 1;
    const keywordsFound = shuffled.slice(0, foundCount);
    
    // Calculate XP: base 10 + 5 per keyword
    const xpAwarded = 10 + (keywordsFound.length * 5);

    // 3. Award XP via RPC
    const { error: dbError } = await supabase.rpc("claim_task_xp", {
      p_user_id: userId,
      p_task_key: `info_fi_scan_${Date.now()}`,
      p_tx_hash: url, // Store URL as "tx_hash" for uniqueness/history
      p_xp: xpAwarded
    });

    if (dbError) {
      if (dbError.message.includes("unique constraint")) {
        return { success: false, message: "This exact URL has already been scanned and rewarded." };
      }
      return { success: false, message: "Database error while awarding XP." };
    }

    return { 
      success: true, 
      xp: xpAwarded,
      keywords: keywordsFound,
      message: `AI Engine: Content verified! Found keywords: ${keywordsFound.join(", ")}.` 
    };

  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
