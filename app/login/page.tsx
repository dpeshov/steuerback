'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerAdmin } from '@/app/actions/registerAdmin'
import { ArrowRight, Eye, EyeOff, Shield, User, UserPlus, CheckCircle } from 'lucide-react'

type Role = 'user' | 'admin'
type AdminMode = 'login' | 'register'

export default function LoginPage() {
  const [role, setRole] = useState<Role>('user')
  const [adminMode, setAdminMode] = useState<AdminMode>('login')

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Register state
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regShowPass, setRegShowPass] = useState(false)
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const switchRole = (r: Role) => {
    setRole(r)
    setError('')
    setRegError('')
    setRegSuccess(false)
    setAdminMode('login')
  }

  const switchAdminMode = (m: AdminMode) => {
    setAdminMode(m)
    setError('')
    setRegError('')
    setRegSuccess(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
    } else {
      router.push(role === 'admin' ? '/admin' : '/dashboard')
      router.refresh()
    }
  }

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (regPassword.length < 6) return setRegError('Password must be at least 6 characters.')
    if (regPassword !== regConfirm) return setRegError('Passwords do not match.')
    setRegLoading(true)
    const result = await registerAdmin(regEmail, regPassword)
    setRegLoading(false)
    if (result?.error) {
      setRegError(result.error)
    } else {
      setRegSuccess(true)
    }
  }

  const inp = 'w-full bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] focus:border-brand-red/50 focus:bg-white/[0.09] rounded-2xl px-4 py-3.5 text-sm text-white outline-none transition-all duration-150 placeholder:text-white/15'
  const lbl = 'block text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2'

  return (
    <div
      className="min-h-screen bg-[#0A0A15] flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[300px] h-[300px] bg-blue-600/6 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="relative font-black text-[1.6rem] text-white tracking-tight mb-8 select-none">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/[0.045] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-6 sm:p-8">

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-1.5 mb-7 p-1.5 bg-white/[0.04] rounded-2xl">
            {([
              { id: 'user' as Role, icon: User, label: 'User Portal' },
              { id: 'admin' as Role, icon: Shield, label: 'Admin' },
            ]).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => switchRole(id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                  role === id
                    ? id === 'user'
                      ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30'
                      : 'bg-white/12 border border-white/12 text-white'
                    : 'text-white/30 hover:text-white/55'
                }`}
              >
                <Icon size={14} strokeWidth={2.2} />
                {label}
              </button>
            ))}
          </div>

          {/* ── USER LOGIN ── */}
          {role === 'user' && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-black text-white tracking-tight">Welcome back</h1>
                <p className="text-white/35 text-sm mt-1">Sign in to continue your application</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className={lbl}>Email</label>
                  <input type="email" required value={email} autoComplete="email" onChange={e => setEmail(e.target.value)} className={inp} placeholder="you@example.com" />
                </div>
                <div>
                  <label className={lbl}>Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required value={password} autoComplete="current-password" onChange={e => setPassword(e.target.value)} className={`${inp} pr-12`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/50 transition-colors rounded-lg">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {error && <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-xl font-medium">{error}</div>}
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs text-white/25 hover:text-brand-red/80 transition-colors py-1">Forgot password?</Link>
                </div>
                <button type="submit" disabled={loading} className="group w-full bg-brand-red hover:bg-red-500 active:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all duration-150 hover:shadow-2xl hover:shadow-brand-red/20 active:scale-[0.98] flex items-center justify-center gap-2">
                  {loading ? 'Signing in…' : 'Sign in'}
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </form>
              <p className="text-center text-sm text-white/22 mt-6">
                No account?{' '}
                <Link href="/register" className="text-brand-red font-bold hover:underline">Create one free</Link>
              </p>
            </>
          )}

          {/* ── ADMIN SECTION ── */}
          {role === 'admin' && (
            <>
              {/* Admin mode toggle */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => switchAdminMode('login')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                    adminMode === 'login'
                      ? 'bg-white/10 text-white border border-white/12'
                      : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => switchAdminMode('register')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                    adminMode === 'register'
                      ? 'bg-white/10 text-white border border-white/12'
                      : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  <UserPlus size={13} />
                  Register admin
                </button>
              </div>

              {/* Admin Login */}
              {adminMode === 'login' && (
                <>
                  <div className="mb-6">
                    <h1 className="text-xl font-black text-white tracking-tight">Admin access</h1>
                    <p className="text-white/35 text-sm mt-1">Restricted to team members</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-3">
                    <div>
                      <label className={lbl}>Email</label>
                      <input type="email" required value={email} autoComplete="email" onChange={e => setEmail(e.target.value)} className={inp} placeholder="admin@example.com" />
                    </div>
                    <div>
                      <label className={lbl}>Password</label>
                      <div className="relative">
                        <input type={showPass ? 'text' : 'password'} required value={password} autoComplete="current-password" onChange={e => setPassword(e.target.value)} className={`${inp} pr-12`} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/50 transition-colors rounded-lg">
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    {error && <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-xl font-medium">{error}</div>}
                    <div className="flex justify-end">
                      <Link href="/forgot-password" className="text-xs text-white/25 hover:text-brand-red/80 transition-colors py-1">Forgot password?</Link>
                    </div>
                    <button type="submit" disabled={loading} className="group w-full bg-brand-red hover:bg-red-500 active:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all duration-150 hover:shadow-2xl hover:shadow-brand-red/20 active:scale-[0.98] flex items-center justify-center gap-2">
                      {loading ? 'Signing in…' : 'Sign in'}
                      {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                  </form>
                </>
              )}

              {/* Admin Register */}
              {adminMode === 'register' && (
                <>
                  <div className="mb-6">
                    <h1 className="text-xl font-black text-white tracking-tight">Register admin</h1>
                    <p className="text-white/35 text-sm mt-1">Create a new admin account</p>
                  </div>

                  {regSuccess ? (
                    <div className="text-center py-4">
                      <div className="w-14 h-14 bg-brand-success/15 border border-brand-success/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={26} className="text-brand-success" />
                      </div>
                      <p className="text-white font-bold mb-1">Admin created!</p>
                      <p className="text-white/40 text-sm mb-5">{regEmail} can now sign in as admin.</p>
                      <button
                        onClick={() => { setRegSuccess(false); setAdminMode('login'); setEmail(regEmail) }}
                        className="w-full bg-white/8 hover:bg-white/12 border border-white/10 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all"
                      >
                        Go to sign in
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRegisterAdmin} className="space-y-3">
                      <div>
                        <label className={lbl}>Email</label>
                        <input type="email" required value={regEmail} autoComplete="email" onChange={e => setRegEmail(e.target.value)} className={inp} placeholder="admin@example.com" />
                      </div>
                      <div>
                        <label className={lbl}>Password</label>
                        <div className="relative">
                          <input type={regShowPass ? 'text' : 'password'} required value={regPassword} autoComplete="new-password" onChange={e => setRegPassword(e.target.value)} className={`${inp} pr-12`} placeholder="Min. 6 characters" />
                          <button type="button" onClick={() => setRegShowPass(!regShowPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/50 transition-colors rounded-lg">
                            {regShowPass ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>Confirm password</label>
                        <input type="password" required value={regConfirm} autoComplete="new-password" onChange={e => setRegConfirm(e.target.value)} className={inp} placeholder="••••••••" />
                      </div>
                      {regError && <div className="bg-brand-red/10 border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-xl font-medium">{regError}</div>}
                      <button
                        type="submit"
                        disabled={regLoading}
                        className="group w-full bg-brand-red hover:bg-red-500 active:bg-red-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all duration-150 hover:shadow-2xl hover:shadow-brand-red/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-1"
                      >
                        {regLoading ? 'Creating admin…' : 'Create admin account'}
                        {!regLoading && <UserPlus size={15} />}
                      </button>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
