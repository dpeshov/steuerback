import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { sendEmail, statusChangeEmail } from '@/lib/email'
import type { Database } from '@/types/database'

function adminClient() {
  return createSupabase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const applicationId = session.metadata?.application_id
    if (!applicationId) return NextResponse.json({ received: true })

    const supabase = adminClient()

    await supabase.from('payments').insert({
      application_id: applicationId,
      amount: 70,
      currency: 'EUR',
      payment_type: 'upfront',
      status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string | null,
      stripe_checkout_session_id: session.id,
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
      changed_by: session.metadata?.user_id ?? 'system',
      reason: 'Stripe upfront payment completed',
    })

    const { data: app } = await supabase
      .from('applications')
      .select('tax_year, users(email)')
      .eq('id', applicationId)
      .single()

    if (app) {
      const email = (app.users as { email: string } | null)?.email
      if (email) await sendEmail(statusChangeEmail(email, 'paid', app.tax_year))
    }
  }

  return NextResponse.json({ received: true })
}
