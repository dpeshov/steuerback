'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function ReferralCopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback for older devices
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 font-mono truncate select-all">
        {url}
      </div>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 shrink-0 ${
          copied
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-brand-navy text-white hover:bg-[#252545]'
        }`}
      >
        {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
      </button>
    </div>
  )
}
