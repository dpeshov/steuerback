'use server'
import { createClient } from '@supabase/supabase-js'

export async function registerAdmin(email: string, password: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create the auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) return { error: error.message }

  // Set role to admin in public.users
  const { error: roleError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', data.user.id)

  if (roleError) return { error: roleError.message }

  return { success: true }
}
