'use server'
import { createClient } from '@/lib/supabase/server'

export async function markNotificationsRead() {
  const supabase = await createClient()
  await supabase.auth.updateUser({
    data: { notifications_last_seen: new Date().toISOString() },
  })
}
