import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ApplicationStatus } from '@/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  profile_incomplete: 'Profile Incomplete',
  documents_pending: 'Documents Pending',
  ready_for_payment: 'Ready for Payment',
  paid: 'Paid',
  in_review: 'In Review',
  missing_documents: 'Missing Documents',
  ready_for_submission: 'Ready for Submission',
  submitted: 'Submitted',
  completed: 'Completed',
  rejected: 'Rejected',
}

export const STATUS_MESSAGES: Record<ApplicationStatus, { message: string; next: string }> = {
  draft: { message: 'Your application is started', next: 'Complete your profile' },
  profile_incomplete: { message: 'Profile incomplete', next: 'Fill in missing fields' },
  documents_pending: { message: 'Upload your documents', next: 'Go to Documents' },
  ready_for_payment: { message: 'All documents received', next: 'Choose payment option' },
  paid: { message: 'Payment confirmed — processing started', next: "We'll keep you updated" },
  in_review: { message: 'Our team is reviewing your application', next: 'No action needed' },
  missing_documents: { message: 'Additional documents required', next: "See what's needed" },
  ready_for_submission: { message: 'Ready to send to German tax office', next: 'No action needed' },
  submitted: { message: 'Submitted to Finanzamt', next: 'Expected: 3–6 months' },
  completed: { message: 'Refund processed!', next: 'Check your bank account' },
  rejected: { message: 'Application not approved', next: 'Contact support' },
}
