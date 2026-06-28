import { createAdminClient } from '@/lib/supabase/server'
import { UserPlus, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import LeadsTable from './LeadsTable'

export default async function AdminLeadsPage() {
  const supabase = createAdminClient()

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const allLeads = (leads ?? []) as Array<{
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
    created_at: string
    updated_at: string
  }>

  const newCount = allLeads.filter(l => l.status === 'new').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">Leads</h1>
            {newCount > 0 && (
              <span className="text-xs font-black bg-brand-red text-white px-2.5 py-1 rounded-full">
                {newCount} new
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Potential clients from the public application form
          </p>
        </div>
        <Link
          href="/apply"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-red hover:text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors"
        >
          <ExternalLink size={13} />
          View public form
        </Link>
      </div>

      <LeadsTable leads={allLeads} />
    </div>
  )
}
