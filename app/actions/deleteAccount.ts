'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteAccount() {
  const supabase      = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Sign out first
  await supabase.auth.signOut()

  // Delete via admin client (bypasses RLS)
  await adminSupabase.auth.admin.deleteUser(user.id)

  redirect('/')
}
