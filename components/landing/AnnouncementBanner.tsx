'use client'
import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const STORAGE_KEY = 'sb-banner-dismissed'
const CSS_VAR = '--sb-banner-h'
const BANNER_HEIGHT = '40px'

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      setVisible(true)
      document.documentElement.style.setProperty(CSS_VAR, BANNER_HEIGHT)
    }
    return () => {
      document.documentElement.style.removeProperty(CSS_VAR)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    document.documentElement.style.setProperty(CSS_VAR, '0px')
  }

  if (!visible) return null

  const currentYear = new Date().getFullYear()
  const lastClaimYear = currentYear - 4

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-brand-red text-white text-center py-2.5 px-10 text-sm font-semibold">
      <span className="inline-flex items-center gap-2">
        <AlertCircle size={14} className="shrink-0" />
        <span className="hidden sm:inline">
          Deadline: You can still claim refunds for {lastClaimYear}&ndash;{currentYear - 1}. File before Dec 31, {currentYear}.
        </span>
        <span className="sm:hidden">
          Claim {lastClaimYear}&ndash;{currentYear - 1} before Dec 31!
        </span>
        <Link href="/register" className="underline font-black hover:no-underline ml-1 whitespace-nowrap">
          Start now &rarr;
        </Link>
      </span>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  )
}
