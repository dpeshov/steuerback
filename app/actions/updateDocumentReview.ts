'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail, documentNeedsReuploadEmail } from '@/lib/email'
import type { DocumentReviewStatus } from '@/types/database'

const DOC_LABELS: Record<string, string> = {
  passport: 'Passport / ID',
  lohnsteuer: 'Lohnsteuerbescheinigung',
  payslip: 'Payslips',
  student_proof: 'Student Proof',
  home_tax_statement: 'Home Tax Statement',
  power_of_attorney: 'Power of Attorney',
  bank_proof: 'Bank Proof',
  work_contract: 'Work Contract',
}

export async function updateDocumentReview(
  documentId: string,
  status: DocumentReviewStatus,
  note: string | null,
) {
  const supabase = createAdminClient()

  const { data: { user: admin } } = await supabase.auth.getUser()
  if (!admin) throw new Error('Unauthorized')

  const { data: adminProfile } = await supabase
    .from('users').select('role').eq('id', admin.id).single()
  if (adminProfile?.role !== 'admin') throw new Error('Forbidden')

  await supabase.from('documents').update({
    review_status: status,
    admin_note: note || null,
    reviewed_by: admin?.id ?? null,
    reviewed_at: new Date().toISOString(),
  }).eq('id', documentId)

  if (status === 'needs_reupload') {
    const { data: doc } = await supabase
      .from('documents')
      .select('document_type, application_id, applications(users(email))')
      .eq('id', documentId)
      .single()

    if (doc) {
      const email = (doc.applications as { users: { email: string } | null } | null)?.users?.email
      if (email) {
        const label = DOC_LABELS[doc.document_type] ?? doc.document_type
        await sendEmail(documentNeedsReuploadEmail(email, label, note))
      }
    }
  }
}
