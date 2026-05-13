import { NextResponse } from 'next/server'

// Stub webhook — no Stripe integration active
export async function POST() {
  return NextResponse.json({ received: true })
}
