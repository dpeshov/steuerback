import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail, welcomeEmail } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    if (data.user?.email && data.user.email_confirmed_at) {
      await sendEmail(welcomeEmail(data.user.email))
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
