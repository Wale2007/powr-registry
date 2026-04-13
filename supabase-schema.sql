-- ============================================================
-- POWR.PRO — Supabase Schema Reference
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  github_username TEXT,
  twitter_username TEXT,
  discord_username TEXT,
  reputation_points INT DEFAULT 0,
  farmer_xp INT DEFAULT 0,
  sniper_xp INT DEFAULT 0,
  win_rate_30d DECIMAL(5,2),
  total_volume_usd DECIMAL(15,2),
  health_factor DECIMAL(5,2),
  daily_streak INT DEFAULT 0,
  last_check_in TIMESTAMPTZ,
  role TEXT DEFAULT 'bronze',
  referred_by TEXT,
  referral_code TEXT
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Task Submissions Table (Anti-Cheat)
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  tx_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_task UNIQUE(user_id, task_key)
);

ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own submissions" ON public.task_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON public.task_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, github_username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'user_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. RPC: Increment Farmer XP atomically
CREATE OR REPLACE FUNCTION public.increment_farmer_xp(row_id UUID, xp_amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET farmer_xp = farmer_xp + xp_amount
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: Claim task (insert submission + increment XP in one transaction)
CREATE OR REPLACE FUNCTION public.claim_task_xp(
  p_user_id UUID,
  p_task_key TEXT,
  p_tx_hash TEXT,
  p_xp INT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.task_submissions (user_id, task_key, tx_hash)
  VALUES (p_user_id, p_task_key, p_tx_hash);

  UPDATE public.profiles
  SET farmer_xp = farmer_xp + p_xp
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
