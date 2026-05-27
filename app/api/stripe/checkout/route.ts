import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // ── Real Stripe mode ──────────────────────────────────────────────────────
  if (process.env.STRIPE_SECRET_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `SteuerBack — Tax Year ${app.tax_year}`,
            description: 'German tax refund service — upfront fee',
          },
          unit_amount: 7000, // €70 in cents
        },
        quantity: 1,
      }],
      customer_email: user.email,
      success_url: `${baseUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pay`,
      metadata: { applicationId, userId: user.id },
    })

    // Pre-create pending payment record to match in webhook
    const admin = createAdminClient()
    await admin.from('payments').insert({
      application_id: applicationId,
      amount: 70,
      currency: 'EUR',
      payment_type: 'upfront',
      status: 'pending',
      stripe_checkout_session_id: session.id,
    })

    return NextResponse.json({ url: session.url as string })
  }

  // ── Demo mode (no STRIPE_SECRET_KEY) ─────────────────────────────────────
  const now = new Date().toISOString()

  await supabase.from('payments').insert({
    application_id: applicationId,
    amount: 70,
    currency: 'EUR',
    payment_type: 'upfront',
    status: 'paid',
    paid_at: now,
  })

  await supabase.from('applications').update({
    status: 'paid',
    payment_status: 'paid',
    updated_at: now,
  }).eq('id', applicationId)

  await supabase.from('status_logs').insert({
    application_id: applicationId,
    old_status: 'ready_for_payment',
    new_status: 'paid',
    changed_by: user.id,
    reason: 'Upfront payment (demo mode)',
  })

  return NextResponse.json({ url: `${baseUrl}/pay/success` })
}
