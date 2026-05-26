'use client'
import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-brand-navy hover:bg-[#252545] active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
    >
      <Printer size={15} />
      Print / Save PDF
    </button>
  )
}
