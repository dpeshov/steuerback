'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

/** Generates a unique 8-char referral code for the current user if they don't have one */
export async function ensureReferralCode(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if already has one
  const { data: profile } = await supabase
    .from('profiles').select('referral_code').eq('user_id', user.id).single()

  if (profile?.referral_code) return profile.referral_code

  // Generate a unique code: 8 upper-case alphanumeric chars
  const admin = createAdminClient()
  let code = ''
  let attempts = 0
  while (!code && attempts < 10) {
    attempts++
    const candidate = Math.random().toString(36).slice(2, 6).toUpperCase()
      + Math.random().toString(36).slice(2, 6).toUpperCase()

    const { data: existing } = await admin
      .from('profiles').select('id').eq('referral_code', candidate).maybeSingle()

    if (!existing) code = candidate
  }

  if (!code) return null

  await admin.from('profiles').update({ referral_code: code }).eq('user_id', user.id)
  return code
}

/** Called after signup: if ?ref=CODE was present, record the referral */
export async function recordReferral(referralCode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = createAdminClient()

  // Find the referrer by their code
  const { data: referrer } = await admin
    .from('profiles').select('user_id').eq('referral_code', referralCode).single()

  if (!referrer || referrer.user_id === user.id) return

  // Don't double-insert
  const { data: existing } = await admin
    .from('referrals').select('id')
    .eq('referrer_id', referrer.user_id).eq('referred_id', user.id).maybeSingle()

  if (existing) return

  await admin.from('referrals').insert({
    referrer_id: referrer.user_id,
    referred_id: user.id,
    referred_email: user.email ?? null,
    status: 'registered',
  })
}

/** Upgrade referral status (called from payment/completion hooks) */
export async function upgradeReferralStatus(
  userId: string,
  newStatus: 'applied' | 'paid' | 'completed',
) {
  const admin = createAdminClient()
  await admin.from('referrals')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('referred_id', userId)
    .lt('status', newStatus) // only upgrade, never downgrade
}
