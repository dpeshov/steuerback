'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle, FileText, Calendar } from 'lucide-react'

const TAX_YEARS = [2024, 2023, 2022, 2021, 2020, 2019]

const REQUIREMENTS = [
  'Lohnsteuerbescheinigung from your employer',
  'Monthly payslips from Germany',
  'Passport or national ID',
  'Your bank account IBAN',
]

export default function ApplicationPage() {
  const [taxYear, setTaxYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleStart = async () => {
    if (!taxYear) return
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('applications').insert({
      user_id: user!.id, tax_year: taxYear, status: 'draft',
    })
    if (error) {
      setError(error.code === '23505'
        ? `You already have an application for ${taxYear}.`
        : error.message)
      setLoading(false)
      return
    }
    router.push('/profile')
  }

  return (
    <div className="space-y-4">
      <div className="pt-1">
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">New application</p>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">Pick a tax year</h1>
        <p className="text-gray-400 text-sm mt-0.5">The year you worked in Germany</p>
      </div>

      <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-brand-red/8 rounded-xl flex items-center justify-center">
              <Calendar size={13} className="text-brand-red" strokeWidth={2.2} />
            </div>
            <span className="font-bold text-brand-navy text-sm">Select tax year</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {TAX_YEARS.map(year => {
              const selected = taxYear === year
              return (
                <button
                  key={year}
                  onClick={() => setTaxYear(year)}
                  className={`relative py-4 rounded-xl font-black text-lg transition-all duration-150 active:scale-[0.96] ${
                    selected
                      ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/20'
                      : 'bg-gray-50 text-brand-navy hover:bg-gray-100 active:bg-gray-200 border border-black/[0.06]'
                  }`}
                >
                  {year}
                  {selected && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Requirements */}
        <div className="mx-5 mb-5 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={12} className="text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">What you will need</span>
          </div>
          <div className="space-y-2">
            {REQUIREMENTS.map(req => (
              <div key={req} className="flex items-start gap-2.5">
                <CheckCircle size={12} className="text-brand-success shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-xs text-gray-500 leading-relaxed">{req}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-4 bg-red-50 border border-red-100 text-brand-red text-sm px-4 py-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="px-5 pb-5">
          <button
            onClick={handleStart}
            disabled={!taxYear || loading}
            className="w-full bg-brand-red hover:bg-red-500 active:bg-red-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-150 hover:shadow-xl hover:shadow-brand-red/15 flex items-center justify-center gap-2 text-sm"
          >
            {loading
              ? 'Creating…'
              : taxYear
                ? `Start ${taxYear} application`
                : 'Select a year first'}
            {!loading && taxYear && <ArrowRight size={15} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 pb-1">One application per tax year · Free to start</p>
    </div>
  )
}
