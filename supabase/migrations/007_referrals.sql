-- Add referral_code to profiles
alter table profiles
  add column if not exists referral_code text unique;

-- Referrals tracking table
create table if not exists referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references auth.users(id) on delete cascade,
  referred_id     uuid not null references auth.users(id) on delete cascade,
  referred_email  text,
  status          text not null default 'registered'
                  check (status in ('registered', 'applied', 'paid', 'completed')),
  reward_amount   integer default 0,  -- in cents
  reward_paid     boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(referrer_id, referred_id)
);

-- RLS
alter table referrals enable row level security;

-- Users can see their own referrals (as referrer)
create policy "users_see_own_referrals" on referrals
  for select using (referrer_id = auth.uid());

-- Service role can do everything
create policy "service_role_all_referrals" on referrals
  for all using (true) with check (true);

-- Index for lookups
create index if not exists referrals_referrer_id_idx on referrals(referrer_id);
create index if not exists referrals_referred_id_idx on referrals(referred_id);
create index if not exists profiles_referral_code_idx on profiles(referral_code);
