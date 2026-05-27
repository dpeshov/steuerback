'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, statusChangeEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import type { ApplicationStatus } from '@/types/database'

export async function bulkUpdateStatus(
  applicationIds: string[],
  newStatus: ApplicationStatus,
) {
  if (!applicationIds.length) return { updated: 0 }

  const sessionClient = await createClient()
  const { data: { user: admin } } = await sessionClient.auth.getUser()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createAdminClient()

  const { data: adminProfile } = await supabase
    .from('users').select('role').eq('id', admin.id).single()
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden')

  const now = new Date().toISOString()

  // Fetch current statuses for logging
  const { data: apps } = await supabase
    .from('applications')
    .select('id, status, tax_year, users(email)')
    .in('id', applicationIds)

  if (!apps?.length) return { updated: 0 }

  // Bulk update
  await supabase.from('applications')
    .update({ status: newStatus, updated_at: now })
    .in('id', applicationIds)

  // Log + email each
  await Promise.all(apps.map(async app => {
    await supabase.from('status_logs').insert({
      application_id: app.id,
      old_status: app.status,
      new_status: newStatus,
      changed_by: admin.id,
      reason: 'Bulk status update by admin',
    })

    const email = (app.users as { email: string } | null)?.email
    if (email) {
      await sendEmail(statusChangeEmail(email, newStatus, app.tax_year))
    }
  }))

  revalidatePath('/admin/applications')
  return { updated: apps.length }
}
