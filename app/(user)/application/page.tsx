'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronRight, Calendar, FileText } from 'lucide-react'

const TAX_YEARS = [2024, 2023, 2022, 2021, 2020, 2019]

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
      if (error.code === '23505') {
        setError(`You already have an application for ${taxYear}. Check your dashboard.`)
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/profile')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Start your application</h1>
        <p className="text-gray-500 text-sm mt-1">Select the tax year you worked in Germany</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-brand-navy font-semibold">
          <Calendar size={18} className="text-brand-red" />
          <span>Which year are you filing for?</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {TAX_YEARS.map(year => (
            <button
              key={year}
              onClick={() => setTaxYear(year)}
              className={`py-4 rounded-xl border-2 font-bold text-lg transition-colors ${
                taxYear === year
                  ? 'border-brand-red bg-red-50 text-brand-red'
                  : 'border-gray-200 text-brand-navy hover:border-gray-300'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="p-4 bg-brand-surface rounded-xl text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2 font-semibold text-brand-navy mb-2">
            <FileText size={16} />
            What you will need
          </div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Lohnsteuerbescheinigung (tax certificate from employer)</li>
            <li>Payslips from your time in Germany</li>
            <li>Passport or national ID</li>
            <li>Bank account (IBAN) for the refund transfer</li>
          </ul>
        </div>

        {error && <p className="mb-4 text-brand-red text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          onClick={handleStart}
          disabled={!taxYear || loading}
          className="w-full bg-brand-red hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Creating...' : taxYear ? `Start ${taxYear} application` : 'Select a year first'}
          {!loading && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
