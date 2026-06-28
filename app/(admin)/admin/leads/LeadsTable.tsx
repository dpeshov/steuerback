'use client'
import { useState } from 'react'
import { Phone, Mail, Copy, Check, UserPlus, MessageSquare, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'
import { updateLeadStatus, updateLeadNotes, inviteLead, toggleLeadTest } from './actions'

type Lead = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_country_code: string
  phone_number: string
  contact_app: string
  tax_years: number[]
  has_steuer_id: boolean
  has_payslips: boolean
  status: string
  admin_notes: string | null
  is_test: boolean
  created_at: string
  updated_at: string
}

const STATUS_OPTIONS = [
  { value: 'new',       label: 'New',       color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'invited',   label: 'Invited',   color: 'bg-violet-100 text-violet-700' },
  { value: 'converted', label: 'Converted', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected',  label: 'Rejected',  color: 'bg-gray-100 text-gray-500' },
]

const CONTACT_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  viber: 'Viber',
  other: 'Other',
}

function RelativeTime({ iso }: { iso: string }) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  let label = 'just now'
  if (mins >= 2 && mins < 60) label = `${mins}m ago`
  else if (hours >= 1 && hours < 24) label = `${hours}h ago`
  else if (days >= 1) label = `${days}d ago`
  return <span>{label}</span>
}

function LeadRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(lead.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const statusInfo = STATUS_OPTIONS.find(s => s.value === lead.status) ?? STATUS_OPTIONS[0]

  const handleStatusChange = async (newStatus: string) => {
    await updateLeadStatus(lead.id, newStatus)
  }

  const handleSaveNotes = async () => {
    setSaving(true)
    await updateLeadNotes(lead.id, notes)
    setSaving(false)
  }

  const handleInvite = async () => {
    const result = await inviteLead(lead.id)
    if (result.success && result.registerLink) {
      setInviteLink(result.registerLink)
    }
  }

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="border border-gray-100 rounded-2xl bg-white hover:shadow-md transition-shadow">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-brand-red to-red-400 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-black">
            {lead.first_name[0]}{lead.last_name[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-brand-navy truncate">
            {lead.first_name} {lead.last_name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {lead.email} &middot; {lead.phone_country_code} {lead.phone_number}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {lead.is_test && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">TEST</span>
          )}
          <span className="text-xs text-gray-400">
            {lead.tax_years.sort().join(', ')}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <span className="text-[10px] text-gray-300 hidden md:block w-16 text-right">
          <RelativeTime iso={lead.created_at} />
        </span>
        {expanded ? <ChevronUp size={14} className="text-gray-300" /> : <ChevronDown size={14} className="text-gray-300" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-50 space-y-4">
          {/* Quick info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Contact via</p>
              <p className="text-sm font-semibold text-brand-navy">{CONTACT_LABELS[lead.contact_app] ?? lead.contact_app}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Tax Years</p>
              <p className="text-sm font-semibold text-brand-navy">{lead.tax_years.sort().join(', ')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Steuer-ID</p>
              <p className={`text-sm font-semibold ${lead.has_steuer_id ? 'text-brand-success' : 'text-gray-400'}`}>
                {lead.has_steuer_id ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Payslips</p>
              <p className={`text-sm font-semibold ${lead.has_payslips ? 'text-brand-success' : 'text-gray-400'}`}>
                {lead.has_payslips ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${lead.phone_country_code}${lead.phone_number}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
            >
              <Phone size={12} /> Call
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
            >
              <Mail size={12} /> Email
            </a>

            {/* Status dropdown */}
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold bg-gray-100 border-none rounded-lg px-3 py-2 focus:ring-1 focus:ring-brand-red/30"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {lead.status !== 'invited' && lead.status !== 'converted' && (
              <button
                onClick={handleInvite}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-red hover:bg-red-500 px-4 py-2 rounded-lg transition-colors"
              >
                <UserPlus size={12} /> Invite to register
              </button>
            )}

            <button
              onClick={() => toggleLeadTest(lead.id, !lead.is_test)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                lead.is_test
                  ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <FlaskConical size={12} /> {lead.is_test ? 'Unmark test' : 'Mark as test'}
            </button>
          </div>

          {/* Invite link */}
          {inviteLink && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <p className="flex-1 text-xs text-emerald-700 font-mono truncate">{inviteLink}</p>
              <button onClick={copyLink} className="shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              <MessageSquare size={11} /> Admin notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-brand-red/30 focus:ring-1 focus:ring-brand-red/20 resize-none"
              placeholder="Add notes about this lead..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="mt-2 text-xs font-semibold text-brand-red hover:text-red-500 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)
  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          All ({leads.length})
        </button>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              filter === s.value ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {s.label} ({counts[s.value] ?? 0})
          </button>
        ))}
      </div>

      {/* Lead cards */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(lead => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm font-semibold">No leads found</p>
          <p className="text-gray-300 text-xs mt-1">Share the apply page to start collecting leads.</p>
        </div>
      )}
    </div>
  )
}
