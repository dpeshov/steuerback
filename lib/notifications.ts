import type { SupabaseClient } from '@supabase/supabase-js'

export type AppNotification = {
  id:         string
  type:       'status_change' | 'message' | 'document_review'
  title:      string
  body:       string
  href:       string
  created_at: string
  read:       boolean
}

const STATUS_LABELS: Record<string, string> = {
  profile_incomplete:   'Profile Incomplete',
  documents_pending:    'Documents Pending',
  ready_for_payment:    'Ready to Pay',
  paid:                 'Payment Confirmed',
  in_review:            'Under Review',
  missing_documents:    'Documents Missing',
  ready_for_submission: 'Ready to Submit',
  submitted:            'Submitted to Finanzamt',
  completed:            'Refund Completed 🎉',
  rejected:             'Application Rejected',
}

const DOC_LABELS: Record<string, string> = {
  passport:                  'Passport / ID',
  lohnsteuerbescheinigung:   'Lohnsteuerbescheinigung',
  bank_statement:            'Bank Statement',
  power_of_attorney:         'Vollmacht',
  residence_permit:          'Residence Permit',
  other:                     'Document',
}

export async function getUserNotifications(
  supabase: SupabaseClient,
  userId:   string,
  appIds:   string[],
  lastSeen: string | null,
): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  if (!appIds.length) return { notifications: [], unreadCount: 0 }

  const [statusRes, notesRes, docsRes] = await Promise.all([
    // Admin-initiated status changes only (not the user's own actions)
    supabase
      .from('status_logs')
      .select('id, new_status, created_at, applications(tax_year)')
      .in('application_id', appIds)
      .neq('changed_by', userId)
      .order('created_at', { ascending: false })
      .limit(25),

    // Public notes not sent by the user themselves
    supabase
      .from('notes')
      .select('id, text, created_at')
      .in('application_id', appIds)
      .eq('is_public', true)
      .neq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(25),

    // Documents that were reviewed
    supabase
      .from('documents')
      .select('id, document_type, review_status, reviewed_at')
      .in('application_id', appIds)
      .in('review_status', ['approved', 'rejected', 'needs_reupload'])
      .not('reviewed_at', 'is', null)
      .order('reviewed_at', { ascending: false })
      .limit(25),
  ])

  const items: AppNotification[] = []

  // ── Status changes ────────────────────────────────────────────────────────
  for (const log of statusRes.data ?? []) {
    const appData = Array.isArray(log.applications) ? log.applications[0] : log.applications
    const taxYear = (appData as { tax_year: number } | null)?.tax_year
    const label   = STATUS_LABELS[log.new_status] ?? log.new_status.replace(/_/g, ' ')
    items.push({
      id:         `status_${log.id}`,
      type:       'status_change',
      title:      'Application status updated',
      body:       taxYear ? `${taxYear} return — ${label}` : label,
      href:       '/status',
      created_at: log.created_at,
      read:       lastSeen ? log.created_at <= lastSeen : false,
    })
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  for (const note of notesRes.data ?? []) {
    const preview = note.text.length > 65 ? note.text.slice(0, 65) + '…' : note.text
    items.push({
      id:         `msg_${note.id}`,
      type:       'message',
      title:      'New message from your advisor',
      body:       preview,
      href:       '/messages',
      created_at: note.created_at,
      read:       lastSeen ? note.created_at <= lastSeen : false,
    })
  }

  // ── Document reviews ──────────────────────────────────────────────────────
  for (const doc of docsRes.data ?? []) {
    if (!doc.reviewed_at) continue
    const label  = DOC_LABELS[doc.document_type] ?? 'Document'
    const action = doc.review_status === 'approved'
      ? 'approved ✓'
      : doc.review_status === 'rejected'
        ? 'rejected'
        : 'needs re-upload'

    items.push({
      id:         `doc_${doc.id}`,
      type:       'document_review',
      title:      doc.review_status === 'approved' ? 'Document approved' : 'Document needs attention',
      body:       `${label} ${action}`,
      href:       '/documents',
      created_at: doc.reviewed_at,
      read:       lastSeen ? doc.reviewed_at <= lastSeen : false,
    })
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Dedup (safety)
  const seen   = new Set<string>()
  const unique = items.filter(n => (seen.has(n.id) ? false : (seen.add(n.id), true)))

  const unreadCount = unique.filter(n => !n.read).length

  return { notifications: unique.slice(0, 30), unreadCount }
}
