'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { submitLead, type LeadFormState } from './actions'

const PRIORITY_CODES = [
  { code: '+49',  flag: '🇩🇪', label: 'Germany' },
  { code: '+389', flag: '🇲🇰', label: 'N. Macedonia' },
  { code: '+385', flag: '🇭🇷', label: 'Croatia' },
  { code: '+381', flag: '🇷🇸', label: 'Serbia' },
  { code: '+355', flag: '🇦🇱', label: 'Albania' },
  { code: '+383', flag: '🇽🇰', label: 'Kosovo' },
  { code: '+90',  flag: '🇹🇷', label: 'Turkey' },
  { code: '+375', flag: '🇧🇾', label: 'Belarus' },
  { code: '+995', flag: '🇬🇪', label: 'Georgia' },
  { code: '+7',   flag: '🇰🇿', label: 'Kazakhstan' },
  { code: '+998', flag: '🇺🇿', label: 'Uzbekistan' },
  { code: '+992', flag: '🇹🇯', label: 'Tajikistan' },
  { code: '+387', flag: '🇧🇦', label: 'Bosnia' },
  { code: '+382', flag: '🇲🇪', label: 'Montenegro' },
]

const OTHER_CODES = [
  { code: '+359', flag: '🇧🇬', label: 'Bulgaria' },
  { code: '+420', flag: '🇨🇿', label: 'Czechia' },
  { code: '+36',  flag: '🇭🇺', label: 'Hungary' },
  { code: '+91',  flag: '🇮🇳', label: 'India' },
  { code: '+977', flag: '🇳🇵', label: 'Nepal' },
  { code: '+48',  flag: '🇵🇱', label: 'Poland' },
  { code: '+40',  flag: '🇷🇴', label: 'Romania' },
  { code: '+421', flag: '🇸🇰', label: 'Slovakia' },
  { code: '+380', flag: '🇺🇦', label: 'Ukraine' },
  { code: '+44',  flag: '🇬🇧', label: 'UK' },
  { code: '+1',   flag: '🇺🇸', label: 'USA' },
]

const CONTACT_APPS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'viber',    label: 'Viber' },
  { value: 'other',    label: 'Other' },
]

const currentYear = new Date().getFullYear()
const TAX_YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i)

const inputClass =
  'w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder:text-white/25 focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/30 transition-colors'
const labelClass = 'block text-sm font-semibold text-white/70 mb-2'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-brand-red hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all hover:shadow-lg hover:shadow-brand-red/30 flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          Submitting...
        </>
      ) : (
        'Submit my interest'
      )}
    </button>
  )
}

export default function LeadForm() {
  const [state, formAction] = useFormState<LeadFormState, FormData>(submitLead, {
    success: false,
    error: null,
  })

  if (state.success) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-sm">
        <div className="w-16 h-16 bg-brand-success/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={28} className="text-brand-success" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Thank you!</h2>
        <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
          We received your information. Our team will contact you shortly to help you get your German tax refund.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-6">

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className={labelClass}>First name *</label>
          <input id="first_name" name="first_name" type="text" required className={inputClass} placeholder="John" />
        </div>
        <div>
          <label htmlFor="last_name" className={labelClass}>Last name *</label>
          <input id="last_name" name="last_name" type="text" required className={inputClass} placeholder="Doe" />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>Email address *</label>
        <input id="email" name="email" type="email" required className={inputClass} placeholder="john@example.com" />
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass}>Phone number *</label>
        <div className="flex gap-2">
          <select name="phone_country_code" defaultValue="+49" className={`bg-white/5 border border-white/10 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/30 transition-colors w-[100px] shrink-0`}>
            {PRIORITY_CODES.map(({ code, flag }) => (
              <option key={code} value={code} className="bg-[#1a1a2e] text-white">
                {flag} {code}
              </option>
            ))}
            <option disabled className="bg-[#1a1a2e] text-white/30">──────</option>
            {OTHER_CODES.map(({ code, flag }) => (
              <option key={code} value={code} className="bg-[#1a1a2e] text-white">
                {flag} {code}
              </option>
            ))}
          </select>
          <input name="phone_number" type="tel" required className={`${inputClass} flex-1`} placeholder="170 1234567" />
        </div>
      </div>

      {/* Contact apps */}
      <div>
        <label className={labelClass}>How can we reach you on this number? (select all that apply)</label>
        <div className="flex flex-wrap gap-2">
          {CONTACT_APPS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer hover:border-white/20 transition-colors has-[:checked]:border-brand-red/50 has-[:checked]:bg-brand-red/10"
            >
              <input
                type="checkbox"
                name="contact_app"
                value={value}
                className="accent-brand-red w-3.5 h-3.5 rounded"
              />
              <span className="text-sm text-white/70">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tax years */}
      <div>
        <label className={labelClass}>Which years are you applying for? *</label>
        <div className="flex flex-wrap gap-2">
          {TAX_YEARS.map(year => (
            <label
              key={year}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 cursor-pointer hover:border-white/20 transition-colors has-[:checked]:border-brand-red/50 has-[:checked]:bg-brand-red/10"
            >
              <input
                type="checkbox"
                name="tax_years"
                value={year}
                className="accent-brand-red w-3.5 h-3.5 rounded"
              />
              <span className="text-sm text-white/70">{year}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Documents available */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Do you have a German Tax ID (Steuer-ID)?</label>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-white/20 transition-colors has-[:checked]:border-brand-red/50 has-[:checked]:bg-brand-red/10">
              <input type="radio" name="has_steuer_id" value="yes" className="accent-brand-red w-3.5 h-3.5" />
              <span className="text-sm text-white/70">Yes</span>
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-white/20 transition-colors has-[:checked]:border-brand-red/50 has-[:checked]:bg-brand-red/10">
              <input type="radio" name="has_steuer_id" value="no" defaultChecked className="accent-brand-red w-3.5 h-3.5" />
              <span className="text-sm text-white/70">No</span>
            </label>
          </div>
        </div>
        <div>
          <label className={labelClass}>Do you have payslips from your employer?</label>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-white/20 transition-colors has-[:checked]:border-brand-red/50 has-[:checked]:bg-brand-red/10">
              <input type="radio" name="has_payslips" value="yes" className="accent-brand-red w-3.5 h-3.5" />
              <span className="text-sm text-white/70">Yes</span>
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-white/20 transition-colors has-[:checked]:border-brand-red/50 has-[:checked]:bg-brand-red/10">
              <input type="radio" name="has_payslips" value="no" defaultChecked className="accent-brand-red w-3.5 h-3.5" />
              <span className="text-sm text-white/70">No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <SubmitButton />

      <p className="text-white/25 text-xs text-center">
        Your data is handled securely and in accordance with GDPR. We will only use it to contact you about your tax refund.
      </p>
    </form>
  )
}
