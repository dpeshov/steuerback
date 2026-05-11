'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, User, Briefcase, CreditCard, MapPin } from 'lucide-react'

type Section = 'personal' | 'address' | 'employment' | 'banking'

const SECTIONS: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'personal', label: 'Personal', icon: User, desc: 'Name, DOB, documents' },
  { id: 'address', label: 'Address', icon: MapPin, desc: 'Where you live now' },
  { id: 'employment', label: 'Employment', icon: Briefcase, desc: 'Work in Germany' },
  { id: 'banking', label: 'Banking', icon: CreditCard, desc: 'Refund destination' },
]

const COUNTRIES = [
  'Albania', 'Bosnia', 'Bulgaria', 'Croatia', 'Germany', 'Kosovo',
  'North Macedonia', 'Montenegro', 'Romania', 'Serbia', 'Slovakia',
  'Slovenia', 'Ukraine', 'Poland', 'Czech Republic', 'Hungary', 'Other',
]

export default function ProfilePage() {
  const [active, setActive] = useState<Section>('personal')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', nationality: '', phone: '',
    country_of_residence: '', city: '', address: '',
    passport_number: '', document_type: '', issuing_country: '', document_expiry: '', tax_id: '',
    student_status: false, university: '',
    employer_name: '', work_start: '', work_end: '', gross_income_eur: '',
    bank_name: '', iban: '', swift_bic: '', bank_account_holder: '', bank_country: '',
  })
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single()
      if (data) {
        setForm(prev => ({
          ...prev,
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          date_of_birth: data.date_of_birth ?? '',
          nationality: data.nationality ?? '',
          phone: data.phone ?? '',
          country_of_residence: data.country_of_residence ?? '',
          city: data.city ?? '',
          address: data.address ?? '',
          passport_number: data.passport_number ?? '',
          document_type: data.document_type ?? '',
          issuing_country: data.issuing_country ?? '',
          document_expiry: data.document_expiry ?? '',
          tax_id: data.tax_id ?? '',
          student_status: data.student_status ?? false,
          university: data.university ?? '',
          employer_name: data.employer_name ?? '',
          work_start: data.work_start ?? '',
          work_end: data.work_end ?? '',
          gross_income_eur: data.gross_income_eur?.toString() ?? '',
          bank_name: data.bank_name ?? '',
          iban: data.iban ?? '',
          swift_bic: data.swift_bic ?? '',
          bank_account_holder: data.bank_account_holder ?? '',
          bank_country: data.bank_country ?? '',
        }))
      }
    }
    load()
  }, [supabase])

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({
      ...form,
      gross_income_eur: form.gross_income_eur ? parseFloat(form.gross_income_eur) : null,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inp = 'w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-brand-red focus:bg-white rounded-2xl px-4 py-3.5 text-sm text-brand-navy outline-none transition-all placeholder:text-gray-300'
  const lbl = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2'

  const activeSection = SECTIONS.find(s => s.id === active)!
  const sectionIndex = SECTIONS.findIndex(s => s.id === active)

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <p className="text-xs font-bold text-brand-red uppercase tracking-widest mb-1">Profile</p>
        <h1 className="text-3xl font-black text-brand-navy tracking-tight">Your profile</h1>
        <p className="text-gray-400 text-sm mt-1">Complete all sections for your tax return</p>
      </div>

      {/* Section tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {SECTIONS.map(({ id, label, icon: Icon, desc }, i) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'bg-brand-navy border-brand-navy text-white shadow-lg shadow-brand-navy/15'
                  : 'bg-white border-gray-100 text-brand-navy hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Icon size={15} className={isActive ? 'text-white' : 'text-brand-red'} />
                <span className={`text-xs font-black ${isActive ? 'text-white/40' : 'text-gray-200'}`}>
                  0{i + 1}
                </span>
              </div>
              <span className="text-sm font-bold">{label}</span>
              <span className={`text-xs mt-0.5 ${isActive ? 'text-white/45' : 'text-gray-400'}`}>{desc}</span>
            </button>
          )
        })}
      </div>

      {/* Form card */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center">
              <activeSection.icon size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-brand-navy text-sm">{activeSection.label}</h2>
              <p className="text-xs text-gray-400">{activeSection.desc}</p>
            </div>
          </div>
          <span className="text-xs text-gray-300 font-bold">{sectionIndex + 1} / {SECTIONS.length}</span>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {active === 'personal' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>First name</label>
                    <input className={inp} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Ana" />
                  </div>
                  <div>
                    <label className={lbl}>Last name</label>
                    <input className={inp} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Popovic" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Date of birth</label>
                    <input type="date" className={inp} value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Nationality</label>
                    <select className={inp} value={form.nationality} onChange={e => set('nationality', e.target.value)}>
                      <option value="">Select</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Phone number</label>
                  <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+389 70 123 456" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Document type</label>
                    <select className={inp} value={form.document_type} onChange={e => set('document_type', e.target.value)}>
                      <option value="">Select</option>
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Document number</label>
                    <input className={inp} value={form.passport_number} onChange={e => set('passport_number', e.target.value)} placeholder="AB123456" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Issuing country</label>
                    <select className={inp} value={form.issuing_country} onChange={e => set('issuing_country', e.target.value)}>
                      <option value="">Select</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Expiry date</label>
                    <input type="date" className={inp} value={form.document_expiry} onChange={e => set('document_expiry', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Tax ID (Steuer-ID) — if known</label>
                  <input className={inp} value={form.tax_id} onChange={e => set('tax_id', e.target.value)} placeholder="12 345 678 901" />
                </div>
              </>
            )}

            {active === 'address' && (
              <>
                <div>
                  <label className={lbl}>Country of residence</label>
                  <select className={inp} value={form.country_of_residence} onChange={e => set('country_of_residence', e.target.value)}>
                    <option value="">Select</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>City</label>
                  <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Skopje" />
                </div>
                <div>
                  <label className={lbl}>Street address</label>
                  <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Ul. Makedonija 12" />
                </div>
              </>
            )}

            {active === 'employment' && (
              <>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.student_status ? 'bg-brand-red' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${form.student_status ? 'left-5' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={form.student_status} onChange={e => set('student_status', e.target.checked)} />
                  <span className="text-sm font-semibold text-brand-navy">I was a student while working in Germany</span>
                </label>
                {form.student_status && (
                  <div>
                    <label className={lbl}>University name</label>
                    <input className={inp} value={form.university} onChange={e => set('university', e.target.value)} placeholder="University of Cologne" />
                  </div>
                )}
                <div>
                  <label className={lbl}>Employer name in Germany</label>
                  <input className={inp} value={form.employer_name} onChange={e => set('employer_name', e.target.value)} placeholder="Amazon Deutschland GmbH" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Work start</label>
                    <input type="date" className={inp} value={form.work_start} onChange={e => set('work_start', e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Work end</label>
                    <input type="date" className={inp} value={form.work_end} onChange={e => set('work_end', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Gross income in Germany (EUR)</label>
                  <input type="number" className={inp} value={form.gross_income_eur} onChange={e => set('gross_income_eur', e.target.value)} placeholder="15 000" />
                </div>
              </>
            )}

            {active === 'banking' && (
              <>
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard size={12} className="text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    The refund will be transferred directly to this account. It must be in your name. We use bank-level encryption.
                  </p>
                </div>
                <div>
                  <label className={lbl}>Account holder name</label>
                  <input className={inp} value={form.bank_account_holder} onChange={e => set('bank_account_holder', e.target.value)} placeholder="Ana Popovic" />
                </div>
                <div>
                  <label className={lbl}>IBAN</label>
                  <input className={`${inp} font-mono`} value={form.iban} onChange={e => set('iban', e.target.value)} placeholder="MK07 1234 5678 9012 345" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>BIC / SWIFT</label>
                    <input className={`${inp} font-mono`} value={form.swift_bic} onChange={e => set('swift_bic', e.target.value)} placeholder="STBKMK2X" />
                  </div>
                  <div>
                    <label className={lbl}>Bank country</label>
                    <select className={inp} value={form.bank_country} onChange={e => set('bank_country', e.target.value)}>
                      <option value="">Select</option>
                      {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Bank name</label>
                  <input className={inp} value={form.bank_name} onChange={e => set('bank_name', e.target.value)} placeholder="Stopanska Banka" />
                </div>
              </>
            )}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className={`mt-6 w-full font-bold py-4 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 ${
              saved
                ? 'bg-brand-success text-white'
                : 'bg-brand-red hover:bg-red-500 text-white hover:shadow-xl hover:shadow-brand-red/20 disabled:opacity-50'
            }`}
          >
            {saved ? <><CheckCircle size={16} /> Saved!</> : saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
