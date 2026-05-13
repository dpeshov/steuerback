'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import { setLocale } from '@/app/actions/setLocale'

const LANGUAGES = [
  { code: 'en', label: 'English',     flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',     flag: '🇩🇪' },
  { code: 'mk', label: 'Македонски',  flag: '🇲🇰' },
  { code: 'sr', label: 'Srpski',      flag: '🇷🇸' },
  { code: 'bs', label: 'Bosanski',    flag: '🇧🇦' },
  { code: 'sq', label: 'Shqip',       flag: '🇦🇱' },
  { code: 'tr', label: 'Türkçe',      flag: '🇹🇷' },
  { code: 'hi', label: 'हिन्दी',       flag: '🇮🇳' },
  { code: 'ne', label: 'नेपाली',      flag: '🇳🇵' },
]

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const current = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0]

  const handleSelect = async (code: string) => {
    if (code === locale) { setOpen(false); return }
    setPending(true)
    setOpen(false)
    await setLocale(code)
    window.location.reload()
  }

  const btnBase = dark
    ? 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8'
    : 'text-gray-500 hover:text-brand-navy bg-gray-50 hover:bg-gray-100 border border-black/[0.06]'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        disabled={pending}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-2 rounded-xl transition-all disabled:opacity-50 ${btnBase}`}
        aria-label="Change language"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <Globe size={11} strokeWidth={2} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 z-50 overflow-hidden py-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 text-left ${
                  lang.code === locale ? 'text-brand-navy font-bold' : 'text-gray-600'
                }`}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span className="flex-1">{lang.label}</span>
                {lang.code === locale && (
                  <span className="text-brand-red text-xs font-black">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
