'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  User, Lock, Bell, Globe, Trash2, CheckCircle, ChevronRight,
  Mail, Phone, Shield, Eye, EyeOff, AlertTriangle, Loader2,
} from 'lucide-react'
import { deleteAccount } from '@/app/actions/deleteAccount'
import LanguageSwitcher from '@/components/LanguageSwitcher'

type Section = 'account' | 'security' | 'notifications' | 'language' | 'danger'

const SECTIONS = [
  { id: 'account'       as Section, icon: User,   label: 'Account',       desc: 'Name, email & phone' },
  { id: 'security'      as Section, icon: Lock,   label: 'Security',      desc: 'Password & 2FA' },
  { id: 'notifications' as Section, icon: Bell,   label: 'Notifications', desc: 'Email preferences' },
  { id: 'language'      as Section, icon: Globe,  label: 'Language',      desc: 'Language & region' },
  { id: 'danger'        as Section, icon: Trash2, label: 'Danger Zone',   desc: 'Delete account' },
]

export default function SettingsPage() {
  const [active,       setActive]    = useState<Section>('account')
  const [email,        setEmail]     = useState('')
  const [firstName,    setFirstName] = useState('')
  const [lastName,     setLastName]  = useState('')
  const [phone,        setPhone]     = useState('')
  const [saving,       setSaving]    = useState(false)
  const [saved,        setSaved]     = useState(false)

  const [resetSent,    setResetSent] = useState(false)
  const [resetting,    setResetting] = useState(false)

  const [emailNotif,   setEmailNotif]   = useState(true)
  const [statusNotif,  setStatusNotif]  = useState(true)
  const [msgNotif,     setMsgNotif]     = useState(true)

  const [deleteInput,  setDeleteInput]  = useState('')
  const [showDelete,   setShowDelete]   = useState(false)
  const [deleting,     setDeleting]     = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('first_name,last_name,phone').eq('user_id', user.id).single()
      if (data) {
        setFirstName(data.first_name ?? '')
        setLastName(data.last_name  ?? '')
        setPhone(data.phone         ?? '')
      }
    }
    load()
  }, [supabase])

  const saveAccount = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({
      first_name: firstName.trim() || null,
      last_name:  lastName.trim()  || null,
      phone:      phone.trim()     || null,
    }).eq('user_id', user!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const sendPasswordReset = async () => {
    setResetting(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setResetting(false)
    setResetSent(true)
    setTimeout(() => setResetSent(false), 5000)
  }

  const handleDelete = async () => {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    await deleteAccount()
  }

  const inp = 'w-full bg-gray-50 border border-black/[0.07] hover:border-black/[0.12] focus:border-brand-red/40 focus:bg-white focus:ring-2 focus:ring-brand-red/10 rounded-xl px-4 py-3 text-sm text-brand-navy outline-none transition-all duration-150 placeholder:text-gray-300'
  const lbl = 'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5'

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-all duration-200 relative shrink-0 ${on ? 'bg-brand-red' : 'bg-gray-200'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 shadow-sm ${on ? 'left-6' : 'left-1'}`} />
    </button>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Account</p>
        <h1 className="text-2xl font-black text-brand-navy">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-4 items-start">
        {/* ── Sidebar nav ─────────────────────────────────────────── */}
        <nav className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {SECTIONS.map(({ id, icon: Icon, label, desc }) => {
            const active_ = active === id
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 ${
                  active_
                    ? 'bg-brand-red/5 border-r-2 border-brand-red'
                    : 'hover:bg-gray-50 border-r-2 border-transparent'
                } ${id === 'danger' ? 'mt-1 border-t border-gray-50' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  active_
                    ? id === 'danger' ? 'bg-red-100' : 'bg-brand-red/10'
                    : 'bg-gray-100'
                }`}>
                  <Icon size={14} className={
                    active_
                      ? id === 'danger' ? 'text-red-500' : 'text-brand-red'
                      : 'text-gray-400'
                  } strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold leading-tight ${
                    active_
                      ? id === 'danger' ? 'text-red-500' : 'text-brand-red'
                      : 'text-brand-navy'
                  }`}>{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                </div>
                <ChevronRight size={12} className={active_ ? 'text-brand-red' : 'text-gray-300'} />
              </button>
            )
          })}
        </nav>

        {/* ── Content panel ─────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">

          {/* ── ACCOUNT ───────────────────────────────────────────── */}
          {active === 'account' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-brand-navy text-lg mb-0.5">Account Details</h2>
                <p className="text-sm text-gray-400">Update your name and contact info</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>First name</label>
                  <input className={inp} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ana" />
                </div>
                <div>
                  <label className={lbl}>Last name</label>
                  <input className={inp} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Popovic" />
                </div>
              </div>

              <div>
                <label className={lbl}>Email address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    className={`${inp} pl-9 opacity-60 cursor-not-allowed`}
                    value={email}
                    readOnly
                    title="Contact support to change your email"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed here. Contact support.</p>
              </div>

              <div>
                <label className={lbl}>Phone number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input className={`${inp} pl-9`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+389 70 123 456" type="tel" />
                </div>
              </div>

              <button
                onClick={saveAccount}
                disabled={saving}
                className={`flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-all active:scale-[0.98] ${
                  saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-red hover:bg-red-500 text-white shadow-sm shadow-brand-red/20'
                } disabled:opacity-50`}
              >
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : saved
                    ? <><CheckCircle size={14} /> Saved!</>
                    : 'Save changes'
                }
              </button>
            </div>
          )}

          {/* ── SECURITY ──────────────────────────────────────────── */}
          {active === 'security' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-brand-navy text-lg mb-0.5">Security</h2>
                <p className="text-sm text-gray-400">Manage your password and account security</p>
              </div>

              <div className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <Lock size={16} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy text-sm">Change Password</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      We&apos;ll send a secure reset link to <strong>{email}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={sendPasswordReset}
                  disabled={resetting || resetSent}
                  className={`flex items-center gap-2 font-bold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] ${
                    resetSent
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100'
                  } disabled:opacity-50`}
                >
                  {resetting
                    ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
                    : resetSent
                      ? <><CheckCircle size={13} /> Link sent — check your email</>
                      : <><Mail size={13} /> Send reset link</>
                  }
                </button>
              </div>

              <div className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <Shield size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-navy text-sm">Account Protection</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Your account is secured with email-based authentication via Supabase.
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                      <CheckCircle size={10} />
                      Protected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ─────────────────────────────────────── */}
          {active === 'notifications' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-brand-navy text-lg mb-0.5">Notifications</h2>
                <p className="text-sm text-gray-400">Choose what updates you receive by email</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Status updates',   desc: 'When your application status changes', on: statusNotif, toggle: () => setStatusNotif(v => !v) },
                  { label: 'New messages',      desc: 'When our team sends you a message',    on: msgNotif,    toggle: () => setMsgNotif(v => !v) },
                  { label: 'Email newsletter',  desc: 'Tips, deadlines, and tax news',        on: emailNotif,  toggle: () => setEmailNotif(v => !v) },
                ].map(({ label, desc, on, toggle }) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/70 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-brand-navy">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <Toggle on={on} onToggle={toggle} />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                <Bell size={13} className="text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700">
                  Notification preferences are saved automatically.
                </p>
              </div>
            </div>
          )}

          {/* ── LANGUAGE ──────────────────────────────────────────── */}
          {active === 'language' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-brand-navy text-lg mb-0.5">Language & Region</h2>
                <p className="text-sm text-gray-400">Choose your preferred language for the app</p>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Display Language</p>
                <LanguageSwitcher />
                <p className="text-xs text-gray-400 mt-3">
                  The page will reload when you switch languages.
                </p>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Region</p>
                <p className="text-sm font-semibold text-brand-navy">Germany (DE) — Tax Region</p>
                <p className="text-xs text-gray-400 mt-1">
                  All tax calculations are based on German tax law (Einkommensteuergesetz).
                </p>
              </div>
            </div>
          )}

          {/* ── DANGER ZONE ───────────────────────────────────────── */}
          {active === 'danger' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-black text-red-500 text-lg mb-0.5 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Danger Zone
                </h2>
                <p className="text-sm text-gray-400">These actions are permanent and cannot be undone</p>
              </div>

              <div className="border-2 border-red-100 rounded-2xl p-5 bg-red-50/30">
                <h3 className="font-bold text-brand-navy mb-1">Delete your account</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  This will permanently delete your account, all applications, documents, and messages. This cannot be undone.
                </p>

                {!showDelete ? (
                  <button
                    onClick={() => setShowDelete(true)}
                    className="flex items-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <Trash2 size={13} />
                    Delete my account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-red-100 border border-red-200 rounded-xl">
                      <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                        <AlertTriangle size={12} />
                        Type <code className="bg-red-200 px-1.5 py-0.5 rounded font-mono mx-1">DELETE</code> to confirm
                      </p>
                    </div>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={e => setDeleteInput(e.target.value)}
                      placeholder="Type DELETE here"
                      className="w-full border border-red-200 bg-white rounded-xl px-4 py-3 text-sm font-mono text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 placeholder:text-red-200"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDelete}
                        disabled={deleteInput !== 'DELETE' || deleting}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                      >
                        {deleting
                          ? <><Loader2 size={13} className="animate-spin" /> Deleting…</>
                          : <><Trash2 size={13} /> Permanently delete</>
                        }
                      </button>
                      <button
                        onClick={() => { setShowDelete(false); setDeleteInput('') }}
                        className="text-sm text-gray-400 hover:text-gray-600 font-semibold px-3 py-2.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
