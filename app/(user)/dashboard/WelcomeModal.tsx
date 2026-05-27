'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, User, FileText, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react'

const STORAGE_KEY = 'sb_welcome_seen'

export default function WelcomeModal({ firstName }: { firstName?: string | null }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Delay slightly so layout paints first
    const t = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up sm:animate-pop-in">

        {/* Brand header */}
        <div className="bg-brand-navy px-6 pt-7 pb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center shadow-lg shadow-brand-red/30">
                <ShieldCheck size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-lg">
                Steuer<span className="text-brand-red">Back</span>
              </span>
            </div>
            <button
              onClick={dismiss}
              className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <h2 className="text-xl font-black leading-tight">
            {firstName ? `Welcome, ${firstName}! 🎉` : 'Welcome aboard! 🎉'}
          </h2>
          <p className="text-white/50 text-sm mt-1.5 leading-relaxed">
            Get your German tax refund in 3 simple steps.
            Most workers get <strong className="text-white">€300–€2,000 back.</strong>
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-0">
          {[
            {
              num: '1',
              icon: User,
              title: 'Complete your profile',
              desc: 'Personal details, employer info, bank IBAN',
              color: 'bg-orange-100 text-orange-600',
            },
            {
              num: '2',
              icon: FileText,
              title: 'Upload documents',
              desc: 'Lohnsteuerbescheinigung, passport, Vollmacht',
              color: 'bg-blue-100 text-blue-600',
            },
            {
              num: '3',
              icon: CreditCard,
              title: 'Pay & we handle the rest',
              desc: 'We file with Finanzamt and track your refund',
              color: 'bg-emerald-100 text-emerald-600',
            },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                  <step.icon size={16} />
                </div>
                {i < 2 && <div className="w-0.5 h-5 bg-gray-100 my-0.5" />}
              </div>
              <div className="pt-1.5 pb-4">
                <p className="text-sm font-bold text-brand-navy">{step.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-1 space-y-2">
          <Link
            href="/profile"
            onClick={dismiss}
            className="flex items-center justify-center gap-2 w-full bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-brand-red/20"
          >
            Start with my profile <ArrowRight size={14} />
          </Link>
          <button
            onClick={dismiss}
            className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
          >
            I&apos;ll explore on my own
          </button>
        </div>
      </div>
    </div>
  )
}
