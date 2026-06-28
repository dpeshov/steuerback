'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{ top: 'var(--sb-banner-h, 0px)' }} className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-[#0D0D1A]/90 backdrop-blur-2xl border-b border-white/5 shadow-xl shadow-black/30'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-xl tracking-tight text-white">
          Steuer<span className="text-brand-red">Back</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { href: '/how-it-works', label: 'How it works' },
            { href: '/calculate',    label: 'Tax Calculator' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/faq', label: 'FAQ' },
            { href: '/apply', label: 'Apply' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className={`px-4 py-2 rounded-xl transition-all ${
              href === '/apply' ? 'text-brand-red hover:text-red-400 font-semibold hover:bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}>
              {label}
            </Link>
          ))}
          <div className="w-px h-5 bg-white/10 mx-2" />
          <LanguageSwitcher dark />
          <div className="w-px h-5 bg-white/10 mx-1" />
          <Link href="/login" className="px-4 py-2 text-white/60 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/register" className="ml-1 bg-brand-red hover:bg-red-500 text-white font-semibold px-5 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-red/30">
            Get started
          </Link>
        </nav>

        <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0D0D1A]/95 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex flex-col gap-1">
          {[
            { href: '/how-it-works', label: 'How it works' },
            { href: '/calculate',    label: 'Tax Calculator' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/faq', label: 'FAQ' },
            { href: '/apply', label: 'Apply' },
            { href: '/login', label: 'Login' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={`py-3 px-4 hover:bg-white/5 rounded-xl transition-all text-sm ${
              href === '/apply' ? 'text-brand-red font-semibold' : 'text-white/70 hover:text-white'
            }`}>
              {label}
            </Link>
          ))}
          <Link href="/register" onClick={() => setOpen(false)} className="mt-2 bg-brand-red text-white font-semibold px-4 py-3 rounded-xl text-sm text-center hover:bg-red-500 transition-colors">
            Get started free
          </Link>
        </div>
      )}
    </header>
  )
}
