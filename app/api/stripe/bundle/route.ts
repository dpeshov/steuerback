import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail, statusChangeEmail } from '@/lib/email'

// ── Bundle pricing ────────────────────────────────────────────────────────────
// upfront[n] = bundle price for n years; deferred[n] = deferred bundle price
const UPFRONT_PRICES  = [0, 70, 110, 140, 160] // €70/yr → €27.50/yr avg at 4
const DEFERRED_PRICES = [0, 150, 230, 290, 340]

export function getBundlePrice(count: number, type: 'upfront' | 'deferred') {
  const table = type === 'upfront' ? UPFRONT_PRICES : DEFERRED_PRICES
  if (count <= 0) return 0
  if (count < table.length) return table[count]
  // For 5+ years: add €60/yr upfront or €90/yr deferred beyond 4
  const extra = count - 4
  return (table[4] ?? 0) + extra * (type === 'upfront' ? 60 : 90)
}

export function getBundleSavings(count: number, type: 'upfront' | 'deferred') {
  const single = type === 'upfront' ? 70 : 150
  return single * count - getBundlePrice(count, type)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { applicationIds, paymentType } = (await req.json()) as {
    applicationIds: string[]
    paymentType:    'upfront' | 'deferred'
  }

  if (!applicationIds?.length || applicationIds.length < 2) {
    return NextResponse.json({ error: 'Need at least 2 applications for a bundle' }, { status: 400 })
  }
  if (paymentType !== 'upfront' && paymentType !== 'deferred') {
    return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
  }

  // Verify all apps belong to this user and are ready_for_payment
  const { data: apps } = await supabase
    .from('applications')
    .select('id, status, tax_year')
    .in('id', applicationIds)
    .eq('user_id', user.id)

  if (!apps || apps.length !== applicationIds.length) {
    return NextResponse.json({ error: 'One or more applications not found' }, { status: 400 })
  }
  if (apps.some(a => a.status !== 'ready_for_payment')) {
    return NextResponse.json({ error: 'One or more applications are not ready for payment' }, { status: 400 })
  }

  const count       = apps.length
  const totalAmount = getBundlePrice(count, paymentType)
  const baseUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const years       = apps.map(a => a.tax_year).sort((a, b) => a - b).join(', ')
  const now         = new Date().toISOString()

  // ── Real Stripe mode ────────────────────────────────────────────────────────
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
            name:        `SteuerBack Bundle — Tax Years ${years}`,
            description: `${count}-year bundle · ${paymentType === 'upfront' ? 'Upfront payment' : 'Pay from refund agreement'}`,
          },
          unit_amount: totalAmount * 100,
        },
        quantity: 1,
      }],
      customer_email: user.email,
      success_url: `${baseUrl}/pay/success?bundle=1&count=${count}`,
      cancel_url:  `${baseUrl}/pay`,
      metadata: {
        applicationIds: applicationIds.join(','),
        userId:         user.id,
        paymentType,
        isBundle:       'true',
      },
    })

    // Pre-create one pending payment per application
    const admin = createAdminClient()
    const perApp = Math.round(totalAmount / count)
    for (const appId of applicationIds) {
      await admin.from('payments').insert({
        application_id:              appId,
        amount:                      perApp,
        currency:                    'EUR',
        payment_type:                paymentType,
        status:                      'pending',
        stripe_checkout_session_id:  session.id,
      })
    }

    return NextResponse.json({ url: session.url as string })
  }

  // ── Demo mode ───────────────────────────────────────────────────────────────
  const perApp = Math.round(totalAmount / count)

  for (const app of apps) {
    await supabase.from('payments').insert({
      application_id: app.id,
      amount:         perApp,
      currency:       'EUR',
      payment_type:   paymentType,
      status:         paymentType === 'upfront' ? 'paid' : 'pending',
      paid_at:        paymentType === 'upfront' ? now : null,
    })

    await supabase.from('applications').update({
      status:         'paid',
      payment_status: paymentType === 'upfront' ? 'paid' : 'pending',
      updated_at:     now,
    }).eq('id', app.id)

    await supabase.from('status_logs').insert({
      application_id: app.id,
      old_status:     'ready_for_payment',
      new_status:     'paid',
      changed_by:     user.id,
      reason:         `Bundle payment (${count} years, demo mode)`,
    })
  }

  // Upgrade referral
  await supabase
    .from('referrals')
    .update({ status: 'paid', updated_at: now })
    .eq('referred_id', user.id)
    .in('status', ['registered', 'applied'])

  // Send one confirmation email for the whole bundle (use first app's tax_year)
  if (user.email) {
    await sendEmail(statusChangeEmail(user.email, 'paid', apps[0].tax_year))
  }

  const redirectParam = paymentType === 'deferred' ? '?deferred=1' : ''
  return NextResponse.json({ url: `${baseUrl}/pay/success?bundle=1&count=${count}${redirectParam ? '&deferred=1' : ''}` })
}
