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
  'Your bank account IBAN for the transfer',
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
      user_id: user!.id,
      tax_year: taxYear,
      status: 'draft',
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
    <div className="space-y-5">
      <div className="pt-2">
        <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-1">New application</p>
        <h1 className="text-3xl font-black text-brand-navy tracking-tight">Pick a tax year</h1>
        <p className="text-gray-400 text-sm mt-1">Select the year you worked in Germany</p>
      </div>

      {/* Year selector */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-brand-red/8 rounded-xl flex items-center justify-center">
              <Calendar size={15} className="text-brand-red" />
            </div>
            <span className="font-bold text-brand-navy text-sm">Select tax year</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {TAX_YEARS.map(year => {
              const selected = taxYear === year
              return (
                <button
                  key={year}
                  onClick={() => setTaxYear(year)}
                  className={`relative py-5 rounded-2xl font-black text-xl transition-all duration-200 ${
                    selected
                      ? 'bg-brand-navy text-white shadow-xl shadow-brand-navy/20 scale-[1.03]'
                      : 'bg-gray-50 text-brand-navy hover:bg-gray-100 border border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {year}
                  {selected && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* What you need */}
        <div className="mx-6 mb-6 bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={13} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">What you will need</span>
          </div>
          <div className="space-y-2">
            {REQUIREMENTS.map(req => (
              <div key={req} className="flex items-start gap-2.5">
                <CheckCircle size={13} className="text-brand-success shrink-0 mt-0.5" />
                <span className="text-xs text-gray-500 leading-relaxed">{req}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-100 text-brand-red text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="px-6 pb-6">
          <button
            onClick={handleStart}
            disabled={!taxYear || loading}
            className="w-full bg-brand-red hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all hover:shadow-xl hover:shadow-brand-red/20 flex items-center justify-center gap-2 text-sm"
          >
            {loading
              ? 'Creating application...'
              : taxYear
                ? `Start ${taxYear} application`
                : 'Select a year to continue'}
            {!loading && taxYear && <ArrowRight size={15} />}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-300">
        One application per tax year. Free to start.
      </p>
    </div>
  )
}
