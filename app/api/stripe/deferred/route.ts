import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, statusChangeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { applicationId } = await req.json()

  const { data: app } = await supabase
    .from('applications')
    .select('id, status, tax_year')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (!app || app.status !== 'ready_for_payment') {
    return NextResponse.json({ error: 'Invalid application' }, { status: 400 })
  }

  const now = new Date().toISOString()

  await supabase.from('payments').insert({
    application_id: applicationId,
    amount: 150,
    currency: 'EUR',
    payment_type: 'deferred',
    status: 'pending',
  })

  await supabase.from('applications').update({
    status:         'paid',
    payment_status: 'pending',
    updated_at:     now,
  }).eq('id', applicationId)

  await supabase.from('status_logs').insert({
    application_id: applicationId,
    old_status:     'ready_for_payment',
    new_status:     'paid',
    changed_by:     user.id,
    reason:         'Deferred payment agreement accepted',
  })

  // Upgrade referral (they've applied/agreed to pay)
  await supabase
    .from('referrals')
    .update({ status: 'applied', updated_at: now })
    .eq('referred_id', user.id)
    .eq('status', 'registered')

  // Notify user
  if (user.email) {
    await sendEmail(statusChangeEmail(user.email, 'paid', app.tax_year))
  }

  return NextResponse.json({ success: true })
}
