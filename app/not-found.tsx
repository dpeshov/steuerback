import Link from 'next/link'
import { ChevronRight, Home, HelpCircle, Calculator } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center px-4 text-center">

      {/* Animated number */}
      <div className="relative mb-8 select-none">
        <p className="text-[10rem] sm:text-[14rem] font-black text-white/5 leading-none tracking-tight">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-6xl sm:text-8xl font-black text-white/15 leading-none">404</p>
        </div>
      </div>

      {/* Logo */}
      <Link href="/" className="font-black text-2xl text-white tracking-tight mb-6">
        Steuer<span className="text-brand-red">Back</span>
      </Link>

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
        Page not found
      </h1>
      <p className="text-white/40 text-sm sm:text-base max-w-sm mx-auto leading-relaxed mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-3 w-full max-w-md mb-8">
        {[
          { href: '/',            icon: Home,        label: 'Go home',           color: 'bg-white/8 hover:bg-white/12 text-white border-white/10' },
          { href: '/calculate',   icon: Calculator,  label: 'Tax calculator',    color: 'bg-white/8 hover:bg-white/12 text-white border-white/10' },
          { href: '/faq',         icon: HelpCircle,  label: 'FAQ',               color: 'bg-white/8 hover:bg-white/12 text-white border-white/10' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-center gap-2 ${color} border rounded-2xl px-4 py-3 text-sm font-semibold transition-all`}
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </div>

      <Link
        href="/register"
        className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-brand-red/30"
      >
        Get started free <ChevronRight size={14} />
      </Link>

    </div>
  )
}
