import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Dummy checkout — simulates upfront payment without Stripe
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { applicationId } = await req.json()

  const { data: app } = await supabase
    .from('applications')
    .select('id, status')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .single()

  if (!app || app.status !== 'ready_for_payment') {
    return NextResponse.json({ error: 'Invalid application' }, { status: 400 })
  }

  await supabase.from('payments').insert({
    application_id: applicationId,
    amount: 70,
    currency: 'EUR',
    payment_type: 'upfront',
    status: 'paid',
    paid_at: new Date().toISOString(),
  })

  await supabase.from('applications').update({
    status: 'paid',
    payment_status: 'paid',
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId)

  await supabase.from('status_logs').insert({
    application_id: applicationId,
    old_status: 'ready_for_payment',
    new_status: 'paid',
    changed_by: user.id,
    reason: 'Upfront payment (demo)',
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return NextResponse.json({ url: `${baseUrl}/pay/success` })
}
