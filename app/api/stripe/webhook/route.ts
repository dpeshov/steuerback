import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail, statusChangeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ received: true })
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  let event: { type: string; data: { object: Record<string, unknown> } }
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('[webhook] signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    event = JSON.parse(body)
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session  = event.data.object
  const meta     = session.metadata as Record<string, string> | null
  const userId   = meta?.userId
  const isBundle = meta?.isBundle === 'true'

  if (!userId) return NextResponse.json({ received: true })

  const admin = createAdminClient()
  const now   = new Date().toISOString()

  // Mark all payment records for this session as paid
  await admin
    .from('payments')
    .update({
      status:                   'paid',
      paid_at:                  now,
      stripe_payment_intent_id: (session.payment_intent as string | null) ?? null,
    })
    .eq('stripe_checkout_session_id', session.id as string)

  // Collect application IDs — bundle sends comma-separated, single sends one field
  const appIds: string[] = isBundle
    ? (meta?.applicationIds ?? '').split(',').filter(Boolean)
    : meta?.applicationId
      ? [meta.applicationId]
      : []

  if (!appIds.length) return NextResponse.json({ received: true })

  // Update all apps + log + email
  const { data: apps } = await admin
    .from('applications')
    .select('id, status, tax_year, users(email)')
    .in('id', appIds)

  if (!apps?.length) return NextResponse.json({ received: true })

  await Promise.all(apps.map(async app => {
    await admin.from('applications').update({
      status:         'paid',
      payment_status: 'paid',
      updated_at:     now,
    }).eq('id', app.id)

    await admin.from('status_logs').insert({
      application_id: app.id,
      old_status:     app.status,
      new_status:     'paid',
      changed_by:     userId,
      reason:         isBundle
        ? `Stripe bundle checkout.session.completed (${appIds.length} years)`
        : 'Stripe checkout.session.completed',
    })
  }))

  // Upgrade referral once
  await admin
    .from('referrals')
    .update({ status: 'paid', updated_at: now })
    .eq('referred_id', userId)
    .in('status', ['registered', 'applied'])

  // Send one email (first app)
  const firstApp = apps[0]
  const email    = (firstApp.users as { email: string } | null)?.email
  if (email) {
    await sendEmail(statusChangeEmail(email, 'paid', firstApp.tax_year))
  }

  return NextResponse.json({ received: true })
}
