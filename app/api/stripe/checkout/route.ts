import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: 7000,
        product_data: {
          name: `German Tax Refund — ${app.tax_year}`,
          description: 'Upfront payment for SteuerBack tax refund service',
        },
      },
      quantity: 1,
    }],
    metadata: {
      application_id: applicationId,
      user_id: user.id,
    },
    success_url: `${baseUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pay`,
  })

  return NextResponse.json({ url: session.url })
}
