'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, statusChangeEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'
import type { ApplicationStatus } from '@/types/database'

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  oldStatus: ApplicationStatus,
  note: string | null,
) {
  const sessionClient = await createClient()
  const { data: { user: admin } } = await sessionClient.auth.getUser()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createAdminClient()

  const { data: adminProfile } = await supabase
    .from('users').select('role').eq('id', admin.id).single()
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden')

  await supabase.from('applications').update({
    status: newStatus,
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId)

  await supabase.from('status_logs').insert({
    application_id: applicationId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: admin.id,
    reason: note || null,
  })

  const { data: app } = await supabase
    .from('applications')
    .select('tax_year, users(email)')
    .eq('id', applicationId)
    .single()

  if (app) {
    const email = (app.users as { email: string } | null)?.email
    if (email) {
      await sendEmail(statusChangeEmail(email, newStatus, app.tax_year))
    }
  }

  revalidatePath(`/admin/applications/${applicationId}`)
}
