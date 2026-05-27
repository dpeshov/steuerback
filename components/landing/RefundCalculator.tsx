'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator } from 'lucide-react'

function calcRefund(gross: number, months: number, isStudent: boolean): { low: number; high: number } {
  if (!gross || !months) return { low: 0, high: 0 }
  const annual = (gross / months) * 12
  // German income tax rates (simplified)
  let taxPaid = 0
  if (annual <= 10908) taxPaid = 0
  else if (annual <= 15999) taxPaid = ((annual - 10908) * 0.14) * (months / 12)
  else if (annual <= 62809) taxPaid = (((annual - 15999) * 0.24 + 709) * (months / 12))
  else taxPaid = (((annual - 62809) * 0.42 + 13301) * (months / 12))

  // Estimated deductions (Werbungskosten + Sonderausgaben)
  const baseDeduction = 1230 * (months / 12) // Arbeitnehmer-Pauschbetrag
  const studentBonus  = isStudent ? 800 * (months / 12) : 0
  const totalDeduction = baseDeduction + studentBonus

  const refundable = (totalDeduction / (gross || 1)) * taxPaid * 1.1
  const low  = Math.max(100, Math.round(refundable * 0.75 / 50) * 50)
  const high = Math.max(200, Math.round(refundable * 1.25 / 50) * 50)
  return { low, high }
}

export default function RefundCalculator() {
  const [gross,     setGross]     = useState<number>(24000)
  const [months,    setMonths]    = useState<number>(12)
  const [student,   setStudent]   = useState(false)
  const [showResult, setShowResult] = useState(false)

  const { low, high } = calcRefund(gross, months, student)
  const avg = Math.round((low + high) / 2)

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-brand-navy px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center">
            <Calculator size={17} className="text-white" />
          </div>
          <h3 className="text-lg font-black text-white">Refund Calculator</h3>
        </div>
        <p className="text-white/40 text-sm">Estimate your German tax refund in seconds</p>
      </div>

      <div className="p-8 space-y-7">
        {/* Gross income */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-700">Annual gross income in Germany</label>
            <span className="text-sm font-black text-brand-navy">€{gross.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={5000} max={80000} step={1000}
            value={gross}
            onChange={e => setGross(Number(e.target.value))}
            className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-brand-red"
          />
          <div className="flex justify-between text-[11px] text-gray-300 mt-1">
            <span>€5,000</span><span>€80,000</span>
          </div>
        </div>

        {/* Months worked */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-700">Months worked in Germany</label>
            <span className="text-sm font-black text-brand-navy">{months} month{months !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`h-9 rounded-lg text-xs font-bold transition-all ${
                  m <= months
                    ? 'bg-brand-red text-white'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Student toggle */}
        <div className="flex items-center justify-between py-3 border-t border-gray-50">
          <div>
            <p className="text-sm font-bold text-gray-700">Student or part-time worker</p>
            <p className="text-xs text-gray-400 mt-0.5">Students are often eligible for higher refunds</p>
          </div>
          <button
            onClick={() => setStudent(!student)}
            className={`relative w-12 h-6 rounded-full transition-colors ${student ? 'bg-brand-red' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${student ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        {/* Result */}
        <div className={`rounded-2xl p-5 text-center transition-all duration-300 ${
          avg > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'
        }`}>
          {avg > 0 ? (
            <>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Estimated refund</p>
              <div className="flex items-center justify-center gap-3 mb-1">
                <p className="text-4xl font-black text-emerald-700">~€{avg.toLocaleString()}</p>
              </div>
              <p className="text-xs text-emerald-600/70 mb-4">Range: €{low.toLocaleString()} – €{high.toLocaleString()}</p>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed max-w-[260px] mx-auto">
                Estimate based on standard German deductions. Actual amount may vary.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-red/20 active:scale-95"
              >
                Claim my refund <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-400 py-2">Enter your income details above to see your estimate.</p>
          )}
        </div>
      </div>
    </div>
  )
}
