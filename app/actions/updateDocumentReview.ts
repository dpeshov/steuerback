'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail, documentDeclinedEmail } from '@/lib/email'
import type { DocumentReviewStatus } from '@/types/database'

const DOC_LABELS: Record<string, string> = {
  passport:           'Passport / ID',
  lohnsteuer:         'Lohnsteuerbescheinigung',
  payslip:            'Payslips',
  student_proof:      'Student Proof',
  home_tax_statement: 'Home Tax Statement',
  power_of_attorney:  'Power of Attorney',
  bank_proof:         'Bank Proof',
  work_contract:      'Work Contract',
}

const ACTION_LABEL: Partial<Record<DocumentReviewStatus, string>> = {
  rejected:       'rejected',
  needs_reupload: 'flagged for reupload',
}

export async function updateDocumentReview(
  documentId: string,
  status: DocumentReviewStatus,
  note: string | null,
) {
  const sessionClient = await createClient()
  const { data: { user: admin } } = await sessionClient.auth.getUser()
  if (!admin) throw new Error('Unauthorized')

  const supabase = createAdminClient()

  const { data: adminProfile } = await supabase
    .from('users').select('role').eq('id', admin.id).single()
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden')

  // 1. Update the document record
  await supabase.from('documents').update({
    review_status: status,
    admin_note:    note || null,
    reviewed_by:   admin.id,
    reviewed_at:   new Date().toISOString(),
  }).eq('id', documentId)

  // 2. If declined (rejected or needs_reupload) — post to messages + send email
  if (status === 'rejected' || status === 'needs_reupload') {
    const { data: doc } = await supabase
      .from('documents')
      .select('document_type, application_id, applications(user_id, users(email))')
      .eq('id', documentId)
      .single()

    if (doc) {
      const appId   = doc.application_id
      const appData = doc.applications as { user_id: string; users: { email: string } | null } | null
      const email   = appData?.users?.email ?? null
      const label   = DOC_LABELS[doc.document_type] ?? doc.document_type
      const action  = ACTION_LABEL[status]

      // Auto-post a public message so user sees it in Messages tab
      const messageText = note
        ? `📄 Your **${label}** has been ${action}.\n\n_Reason:_ ${note}\n\nPlease visit the Documents page to take action.`
        : `📄 Your **${label}** has been ${action}. Please visit the Documents page for details.`

      await supabase.from('notes').insert({
        application_id: appId,
        text:           messageText,
        created_by:     admin.id,
        is_public:      true,
      })

      // Send email notification
      if (email) {
        await sendEmail(documentDeclinedEmail(email, label, status, note))
      }

      revalidatePath(`/admin/applications/${appId}`)
    }
  }
}
