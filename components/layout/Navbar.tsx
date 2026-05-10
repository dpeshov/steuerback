'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-brand-navy text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight">
          Steuer<span className="text-brand-red">Back</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/how-it-works" className="hover:text-brand-red transition-colors">How it works</Link>
          <Link href="/pricing" className="hover:text-brand-red transition-colors">Pricing</Link>
          <Link href="/faq" className="hover:text-brand-red transition-colors">FAQ</Link>
          <Link href="/login" className="hover:text-brand-red transition-colors">Login</Link>
          <Link href="/register" className="bg-brand-red hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition-colors">
            Start Free
          </Link>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-brand-navy border-t border-white/10 px-4 pb-4 flex flex-col gap-3 text-sm">
          <Link href="/how-it-works" onClick={() => setOpen(false)} className="py-2">How it works</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="py-2">Pricing</Link>
          <Link href="/faq" onClick={() => setOpen(false)} className="py-2">FAQ</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="py-2">Login</Link>
          <Link href="/register" onClick={() => setOpen(false)} className="bg-brand-red px-4 py-2 rounded-lg font-semibold text-center">
            Start Free
          </Link>
        </div>
      )}
    </header>
  )
}
