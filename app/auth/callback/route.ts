import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail, welcomeEmail } from '@/lib/email'
import { recordReferral } from '@/app/actions/referral'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.user) {
      // Send welcome email on first confirmation
      if (data.user.email && data.user.email_confirmed_at) {
        await sendEmail(welcomeEmail(data.user.email))
      }

      // Record referral if the user signed up via a referral link
      const referredBy = data.user.user_metadata?.referred_by as string | undefined
      if (referredBy) {
        await recordReferral(referredBy)
      }

      // Redirect based on role
      const adminClient = createAdminClient()
      const { data: profile } = await adminClient
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const destination = profile?.role === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
