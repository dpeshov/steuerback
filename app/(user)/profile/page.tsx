'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, User, Briefcase, CreditCard, MapPin, ChevronRight, Plus } from 'lucide-react'

type Section = 'personal' | 'address' | 'employment' | 'banking'

const SECTIONS: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'personal', label: 'Personal', icon: User, desc: 'Name & documents' },
  { id: 'address', label: 'Address', icon: MapPin, desc: 'Where you live' },
  { id: 'employment', label: 'Employment', icon: Briefcase, desc: 'Work in Germany' },
  { id: 'banking', label: 'Banking', icon: CreditCard, desc: 'Refund account' },
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
  const [showBankAddress, setShowBankAddress] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', nationality: '', phone: '',
    country_of_residence: '', city: '', address: '',
    passport_number: '', document_type: '', issuing_country: '', document_expiry: '', tax_id: '',
    student_status: false, university: '',
    employer_name: '', work_start: '', work_end: '', gross_income_eur: '',
    bank_name: '', iban: '', swift_bic: '', bank_account_holder: '', bank_country: '',
    bank_address: '',
  })
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single()
      if (data) {
        setForm(prev => ({
          ...prev,
          first_name: data.first_name ?? '', last_name: data.last_name ?? '',
          date_of_birth: data.date_of_birth ?? '', nationality: data.nationality ?? '',
          phone: data.phone ?? '', country_of_residence: data.country_of_residence ?? '',
          city: data.city ?? '', address: data.address ?? '',
          passport_number: data.passport_number ?? '', document_type: data.document_type ?? '',
          issuing_country: data.issuing_country ?? '', document_expiry: data.document_expiry ?? '',
          tax_id: data.tax_id ?? '', student_status: data.student_status ?? false,
          university: data.university ?? '', employer_name: data.employer_name ?? '',
          work_start: data.work_start ?? '', work_end: data.work_end ?? '',
          gross_income_eur: data.gross_income_eur?.toString() ?? '',
          bank_name: data.bank_name ?? '', iban: data.iban ?? '',
          swift_bic: data.swift_bic ?? '', bank_account_holder: data.bank_account_holder ?? '',
          bank_country: data.bank_country ?? '',
          bank_address: data.bank_address ?? '',
        }))
        if (data.bank_address) setShowBankAddress(true)
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

  const inp = 'w-full bg-gray-50 border border-black/[0.07] hover:border-black/[0.12] focus:border-brand-red/50 focus:bg-white rounded-xl px-4 py-3.5 text-sm text-brand-navy outline-none transition-all duration-150 placeholder:text-gray-300'
  const lbl = 'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5'

  const activeSection = SECTIONS.find(s => s.id === active)!
  const sectionIndex = SECTIONS.findIndex(s => s.id === active)

  const goNext = () => {
    const nextIdx = sectionIndex + 1
    if (nextIdx < SECTIONS.length) setActive(SECTIONS[nextIdx].id)
  }

  return (
    <div className="space-y-4">
      <div className="pt-1">
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Profile</p>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">Your profile</h1>
        <p className="text-gray-400 text-sm mt-0.5">Complete all sections for your tax return</p>
      </div>

      {/* Section tabs — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {SECTIONS.map(({ id, label, icon: Icon }, i) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap text-sm font-bold transition-all duration-150 active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-brand-navy border-brand-navy text-white shadow-md shadow-brand-navy/15'
                  : 'bg-white border-black/[0.07] text-gray-500 hover:text-brand-navy hover:border-black/[0.12]'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-white' : 'text-brand-red'} strokeWidth={2.2} />
              <span>{label}</span>
              <span className={`text-[10px] font-black ${isActive ? 'text-white/40' : 'text-gray-200'}`}>0{i + 1}</span>
            </button>
          )
        })}
      </div>

      {/* Form card */}
      <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-navy rounded-xl flex items-center justify-center">
              <activeSection.icon size={14} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <p className="font-bold text-brand-navy text-sm">{activeSection.label}</p>
              <p className="text-[11px] text-gray-400">{activeSection.desc}</p>
            </div>
          </div>
          <span className="text-xs text-gray-300 font-bold">{sectionIndex + 1}/{SECTIONS.length}</span>
        </div>

        <div className="p-5">
          <div className="space-y-4">
            {active === 'personal' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>First name</label>
                    <input className={inp} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Ana" autoComplete="given-name" />
                  </div>
                  <div>
                    <label className={lbl}>Last name</label>
                    <input className={inp} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Popovic" autoComplete="family-name" />
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
                  <input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+389 70 123 456" type="tel" autoComplete="tel" />
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
                    <label className={lbl}>Number</label>
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
                  <label className={lbl}>Tax ID (Steuer-ID) — optional</label>
                  <input className={`${inp} font-mono`} value={form.tax_id} onChange={e => set('tax_id', e.target.value)} placeholder="12 345 678 901" />
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
                  <input className={inp} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Skopje" autoComplete="address-level2" />
                </div>
                <div>
                  <label className={lbl}>Street address</label>
                  <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Ul. Makedonija 12" autoComplete="street-address" />
                </div>
              </>
            )}

            {active === 'employment' && (
              <>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors">
                  <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${form.student_status ? 'bg-brand-red' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${form.student_status ? 'left-6' : 'left-1'}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={form.student_status} onChange={e => set('student_status', e.target.checked)} />
                  <span className="text-sm font-semibold text-brand-navy leading-snug">I was a student while working in Germany</span>
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
                  <input type="number" inputMode="decimal" className={inp} value={form.gross_income_eur} onChange={e => set('gross_income_eur', e.target.value)} placeholder="15 000" />
                </div>
              </>
            )}

            {active === 'banking' && (
              <>
                <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                  <CreditCard size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Refund goes directly to this account. Must be in your name. Bank-level encryption.
                  </p>
                </div>
                <div>
                  <label className={lbl}>Account holder name</label>
                  <input className={inp} value={form.bank_account_holder} onChange={e => set('bank_account_holder', e.target.value)} placeholder="Ana Popovic" autoComplete="name" />
                </div>
                <div>
                  <label className={lbl}>IBAN</label>
                  <input className={`${inp} font-mono tracking-wide`} value={form.iban} onChange={e => set('iban', e.target.value)} placeholder="MK07 1234 5678 9012 345" />
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

                {/* Optional: bank address */}
                {!showBankAddress ? (
                  <button
                    type="button"
                    onClick={() => setShowBankAddress(true)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-red transition-colors group"
                  >
                    <span className="w-5 h-5 rounded-full border-2 border-dashed border-gray-200 group-hover:border-brand-red/40 flex items-center justify-center transition-colors">
                      <Plus size={10} strokeWidth={3} />
                    </span>
                    Add bank address <span className="font-normal text-gray-300">(optional)</span>
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={lbl}>Bank address <span className="text-gray-300 normal-case font-normal tracking-normal">optional</span></label>
                      <button
                        type="button"
                        onClick={() => { setShowBankAddress(false); set('bank_address', '') }}
                        className="text-[10px] text-gray-300 hover:text-red-400 font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      className={inp}
                      value={form.bank_address}
                      onChange={e => set('bank_address', e.target.value)}
                      placeholder="Ul. 11 Oktomvri 3, 1000 Skopje"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={save}
              disabled={saving}
              className={`flex-1 font-bold py-3.5 rounded-xl transition-all duration-150 text-sm flex items-center justify-center gap-2 active:scale-[0.98] ${
                saved
                  ? 'bg-brand-success text-white'
                  : 'bg-brand-red hover:bg-red-500 active:bg-red-600 text-white hover:shadow-lg hover:shadow-brand-red/15 disabled:opacity-50'
              }`}
            >
              {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? 'Saving…' : 'Save changes'}
            </button>

            {sectionIndex < SECTIONS.length - 1 && (
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-brand-navy font-semibold px-4 py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]"
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
