'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordManualPayment(
  applicationId: string,
  amount: number,
  currency: string,
  method: string,
  alsoAdvanceStatus: boolean,
) {
  const sessionClient = await createClient()
  const { data: { user: admin } } = await sessionClient.auth.getUser()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data: adminProfile } = await supabase
    .from('users').select('role').eq('id', admin.id).single()
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden')

  // Get current status before mutating
  const { data: currentApp } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .single()

  // Insert payment record (use stripe_payment_intent_id as method memo)
  await supabase.from('payments').insert({
    application_id: applicationId,
    amount,
    currency,
    payment_type: 'upfront',
    status: 'paid',
    paid_at: new Date().toISOString(),
    stripe_payment_intent_id: `MANUAL:${method === 'cash' ? 'CASH' : 'BANK_TRANSFER'}`,
  })

  // Update application payment_status (and optionally status)
  if (alsoAdvanceStatus) {
    await supabase.from('applications').update({ payment_status: 'paid', status: 'paid' }).eq('id', applicationId)
  } else {
    await supabase.from('applications').update({ payment_status: 'paid' }).eq('id', applicationId)
  }

  // Log status change when advancing
  if (alsoAdvanceStatus && currentApp && currentApp.status !== 'paid') {
    await supabase.from('status_logs').insert({
      application_id: applicationId,
      old_status: currentApp.status,
      new_status: 'paid',
      changed_by: admin.id,
      reason: `Manual payment recorded: ${amount} ${currency} via ${method === 'cash' ? 'cash' : 'bank transfer'}`,
    })
  }

  revalidatePath(`/admin/applications/${applicationId}`)
  revalidatePath('/admin/applications')
}
