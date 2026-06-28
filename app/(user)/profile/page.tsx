'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, User, Briefcase, CreditCard, MapPin, ChevronRight, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

type Section = 'personal' | 'address' | 'employment' | 'banking'

type Employment = {
  id?: string
  employer_name: string
  city: string
  work_start: string
  work_end: string
  gross_income_eur: string
  tax_year: string
  student_status: boolean
  university: string
}

const emptyEmployment = (): Employment => ({
  employer_name: '', city: '', work_start: '', work_end: '',
  gross_income_eur: '', tax_year: '', student_status: false, university: '',
})

const currentYear = new Date().getFullYear()
const TAX_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i)

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
  const [employments, setEmployments] = useState<Employment[]>([])
  const [expandedEmp, setExpandedEmp] = useState<number | null>(null)
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

      // Load employments
      const { data: emps } = await supabase
        .from('employments')
        .select('*')
        .eq('user_id', user!.id)
        .order('tax_year', { ascending: false })

      if (emps && emps.length > 0) {
        setEmployments(emps.map(e => ({
          id: e.id,
          employer_name: e.employer_name ?? '',
          city: e.city ?? '',
          work_start: e.work_start ?? '',
          work_end: e.work_end ?? '',
          gross_income_eur: e.gross_income_eur?.toString() ?? '',
          tax_year: e.tax_year?.toString() ?? '',
          student_status: e.student_status ?? false,
          university: e.university ?? '',
        })))
      }
    }
    load()
  }, [supabase])

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const setEmp = (index: number, field: keyof Employment, value: string | boolean) => {
    setEmployments(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e))
  }

  const addEmployment = () => {
    setEmployments(prev => [...prev, emptyEmployment()])
    setExpandedEmp(employments.length)
  }

  const removeEmployment = (index: number) => {
    setEmployments(prev => prev.filter((_, i) => i !== index))
    setExpandedEmp(null)
  }

  const save = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user!.id

    // Save profile
    await supabase.from('profiles').update({
      ...form,
      gross_income_eur: form.gross_income_eur ? parseFloat(form.gross_income_eur) : null,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId)

    // Save employments: delete all then re-insert
    await supabase.from('employments').delete().eq('user_id', userId)
    if (employments.length > 0) {
      await supabase.from('employments').insert(
        employments
          .filter(e => e.employer_name.trim())
          .map(e => ({
            user_id: userId,
            employer_name: e.employer_name.trim(),
            city: e.city.trim() || null,
            work_start: e.work_start || null,
            work_end: e.work_end || null,
            gross_income_eur: e.gross_income_eur ? parseFloat(e.gross_income_eur) : null,
            tax_year: e.tax_year ? parseInt(e.tax_year) : null,
            student_status: e.student_status,
            university: e.university.trim() || null,
          }))
      )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // min-h-[44px] = Apple/Google minimum touch target
  const inp = 'w-full min-h-[44px] bg-gray-50 border border-black/[0.07] hover:border-black/[0.12] focus:border-brand-red/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-brand-navy outline-none transition-all duration-150 placeholder:text-gray-300'
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
                    <input className={inp} inputMode="text" autoCapitalize="characters" value={form.passport_number} onChange={e => set('passport_number', e.target.value)} placeholder="AB123456" />
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
                  <input className={`${inp} font-mono`} inputMode="numeric" value={form.tax_id} onChange={e => set('tax_id', e.target.value)} placeholder="12 345 678 901" />
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
                <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl mb-1">
                  <Briefcase size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Add each employer you worked for in Germany. You can add multiple entries for different years or different employers.
                  </p>
                </div>

                {employments.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Briefcase size={20} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-semibold">No employments added yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click below to add your first employer</p>
                  </div>
                )}

                {employments.map((emp, i) => {
                  const isOpen = expandedEmp === i
                  const title = emp.employer_name || 'New employment'
                  const subtitle = [emp.tax_year && `Year ${emp.tax_year}`, emp.city].filter(Boolean).join(' · ') || 'Click to fill details'

                  return (
                    <div key={i} className="border border-black/[0.07] rounded-xl overflow-hidden">
                      {/* Card header */}
                      <button
                        type="button"
                        onClick={() => setExpandedEmp(isOpen ? null : i)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-black">{String(i + 1).padStart(2, '0')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-brand-navy truncate">{title}</p>
                          <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
                        </div>
                        {emp.gross_income_eur && (
                          <span className="text-xs font-bold text-brand-success hidden sm:block">
                            €{Number(emp.gross_income_eur).toLocaleString()}
                          </span>
                        )}
                        {isOpen ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
                      </button>

                      {/* Card body */}
                      {isOpen && (
                        <div className="p-4 space-y-3 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 sm:col-span-1">
                              <label className={lbl}>Employer name *</label>
                              <input className={inp} value={emp.employer_name} onChange={e => setEmp(i, 'employer_name', e.target.value)} placeholder="Amazon Deutschland GmbH" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className={lbl}>City in Germany</label>
                              <input className={inp} value={emp.city} onChange={e => setEmp(i, 'city', e.target.value)} placeholder="Berlin" />
                            </div>
                          </div>
                          <div>
                            <label className={lbl}>Tax year</label>
                            <select className={inp} value={emp.tax_year} onChange={e => setEmp(i, 'tax_year', e.target.value)}>
                              <option value="">Select year</option>
                              {TAX_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={lbl}>Work start</label>
                              <input type="date" className={inp} value={emp.work_start} onChange={e => setEmp(i, 'work_start', e.target.value)} />
                            </div>
                            <div>
                              <label className={lbl}>Work end</label>
                              <input type="date" className={inp} value={emp.work_end} onChange={e => setEmp(i, 'work_end', e.target.value)} />
                            </div>
                          </div>
                          <div>
                            <label className={lbl}>Gross income (EUR)</label>
                            <input type="number" inputMode="decimal" className={inp} value={emp.gross_income_eur} onChange={e => setEmp(i, 'gross_income_eur', e.target.value)} placeholder="15 000" />
                          </div>

                          {/* Student toggle */}
                          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${emp.student_status ? 'bg-brand-red' : 'bg-gray-200'}`}>
                              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${emp.student_status ? 'left-[22px]' : 'left-[3px]'}`} />
                            </div>
                            <input type="checkbox" className="hidden" checked={emp.student_status} onChange={e => setEmp(i, 'student_status', e.target.checked)} />
                            <span className="text-xs font-semibold text-brand-navy">Student during this employment</span>
                          </label>
                          {emp.student_status && (
                            <div>
                              <label className={lbl}>University</label>
                              <input className={inp} value={emp.university} onChange={e => setEmp(i, 'university', e.target.value)} placeholder="University of Cologne" />
                            </div>
                          )}

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => removeEmployment(i)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors mt-1"
                          >
                            <Trash2 size={12} /> Remove this employment
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Add button */}
                <button
                  type="button"
                  onClick={addEmployment}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-dashed border-gray-200 hover:border-brand-red/30 rounded-xl text-sm font-bold text-gray-500 hover:text-brand-red transition-all active:scale-[0.99]"
                >
                  <Plus size={15} strokeWidth={2.5} /> Add employment
                </button>
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
                  <input className={`${inp} font-mono tracking-wide`} inputMode="text" autoCapitalize="characters" autoCorrect="off" spellCheck={false} value={form.iban} onChange={e => set('iban', e.target.value.toUpperCase())} placeholder="MK07 1234 5678 9012 345" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>BIC / SWIFT</label>
                    <input className={`${inp} font-mono`} inputMode="text" autoCapitalize="characters" autoCorrect="off" spellCheck={false} value={form.swift_bic} onChange={e => set('swift_bic', e.target.value.toUpperCase())} placeholder="STBKMK2X" />
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

          {/* Actions — sticky on mobile */}
          <div className="flex gap-2 mt-5 md:static fixed bottom-0 left-0 right-0 md:mx-0 md:mb-0 mx-0 z-30 md:z-auto bg-white md:bg-transparent md:shadow-none shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:border-none border-t border-gray-100 p-4 md:p-0"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={save}
              disabled={saving}
              className={`flex-1 min-h-[48px] font-bold rounded-xl transition-all duration-150 text-sm flex items-center justify-center gap-2 active:scale-[0.98] ${
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
                className="min-h-[48px] flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-brand-navy font-semibold px-4 rounded-xl text-sm transition-all active:scale-[0.98]"
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
          {/* Spacer so sticky bar doesn't overlap content on mobile */}
          <div className="h-20 md:hidden" />
        </div>
      </div>
    </div>
  )
}
