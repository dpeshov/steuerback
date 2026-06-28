'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAllTestData() {
  const supabase = createAdminClient()

  // Delete in order: dependent tables first
  const { count: leads } = await supabase
    .from('leads')
    .delete({ count: 'exact' })
    .eq('is_test', true)

  // Get test user IDs for cascading cleanup
  const { data: testUsers } = await supabase
    .from('users')
    .select('id')
    .eq('is_test', true)

  const testUserIds = testUsers?.map(u => u.id) ?? []

  let applications = 0
  if (testUserIds.length > 0) {
    // Delete related data for test applications
    const { data: testApps } = await supabase
      .from('applications')
      .select('id')
      .eq('is_test', true)

    const testAppIds = testApps?.map(a => a.id) ?? []

    if (testAppIds.length > 0) {
      await supabase.from('documents').delete().in('application_id', testAppIds)
      await supabase.from('status_logs').delete().in('application_id', testAppIds)
      await supabase.from('notes').delete().in('application_id', testAppIds)
      await supabase.from('payments').delete().in('application_id', testAppIds)
    }

    const { count } = await supabase
      .from('applications')
      .delete({ count: 'exact' })
      .eq('is_test', true)
    applications = count ?? 0

    // Delete employments for test users
    await supabase.from('employments').delete().in('user_id', testUserIds)

    // Delete profiles for test users
    await supabase.from('profiles').delete().in('user_id', testUserIds)

    // Delete notifications for test users
    await supabase.from('notifications').delete().in('user_id', testUserIds)

    // Delete test users from public.users
    await supabase.from('users').delete().in('id', testUserIds)

    // Delete from auth.users (requires raw SQL via service role)
    for (const uid of testUserIds) {
      await supabase.auth.admin.deleteUser(uid)
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/leads')
  revalidatePath('/admin/applications')
  revalidatePath('/admin/users')

  return {
    leads: leads ?? 0,
    applications,
    users: testUserIds.length,
  }
}
