'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Info, TrendingUp, Banknote, Clock,
  Home, Briefcase, GraduationCap, Calendar,
} from 'lucide-react'

// ── German Grundtarif 2024 (simplified) ──────────────────────────────────────
function germanIncomeTax(income: number): number {
  if (income <= 11784) return 0
  if (income <= 17005) {
    const y = (income - 11784) / 10000
    return Math.round((979.18 * y + 1400) * y)
  }
  if (income <= 66760) {
    const z = (income - 17005) / 10000
    return Math.round((192.59 * z + 2397) * z + 966)
  }
  if (income <= 277825) {
    return Math.round(0.42 * income - 9972)
  }
  return Math.round(0.45 * income - 18307)
}

type Inputs = {
  gross:      number
  months:     number
  isStudent:  boolean
  homeoffice: boolean
  homeofficeDays: number
}

type Result = {
  withheld:        number
  actualDue:       number
  refund:          number
  refundLow:       number
  refundHigh:      number
  effectiveRate:   number
  deductionTotal:  number
  breakdown: { label: string; amount: number }[]
}

function calcRefund(inputs: Inputs): Result {
  const { gross, months, isStudent, homeoffice, homeofficeDays } = inputs
  if (!gross || !months) {
    return { withheld: 0, actualDue: 0, refund: 0, refundLow: 0, refundHigh: 0, effectiveRate: 0, deductionTotal: 0, breakdown: [] }
  }

  // Monthly salary annualised → what employer used to withhold monthly tax
  const monthlyGross  = gross / months
  const annualisedIncome = monthlyGross * 12

  // Total tax withheld over the months worked
  const withheld = Math.round(germanIncomeTax(annualisedIncome) * (months / 12))

  // ── Deductions ────────────────────────────────────────────────────────────
  const werbungskosten = Math.round(Math.min(gross, 1230) * (months / 12))
  const sonderausgaben = Math.round(36 * (months / 12))
  const studentBonus   = isStudent ? Math.round(800 * (months / 12)) : 0
  const homeofficeAmt  = homeoffice ? Math.min(1260, homeofficeDays * 6) : 0

  const breakdown = [
    { label: 'Werbungskosten-Pauschbetrag', amount: werbungskosten },
    { label: 'Sonderausgaben-Pauschbetrag', amount: sonderausgaben },
    ...(studentBonus   > 0 ? [{ label: 'Student / part-time bonus',     amount: studentBonus }]   : []),
    ...(homeofficeAmt  > 0 ? [{ label: 'Homeoffice-Pauschale',          amount: homeofficeAmt }]  : []),
  ]

  const deductionTotal = werbungskosten + sonderausgaben + studentBonus + homeofficeAmt
  const taxableIncome  = Math.max(0, gross - deductionTotal)
  const actualDue      = germanIncomeTax(taxableIncome)
  const refund         = Math.max(0, withheld - actualDue)

  // Confidence range ±18%
  const refundLow  = Math.max(50,  Math.round(refund * 0.82 / 25) * 25)
  const refundHigh = Math.round(refund * 1.18 / 25) * 25
  const effectiveRate = gross > 0 ? Math.round((withheld / gross) * 100 * 10) / 10 : 0

  return { withheld, actualDue, refund, refundLow, refundHigh, effectiveRate, deductionTotal, breakdown }
}

// ── Slider ────────────────────────────────────────────────────────────────────
function Slider({
  label, value, min, max, step, format, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <span className="text-sm font-black text-brand-navy">{format(value)}</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full">
        <div
          className="absolute left-0 top-0 h-2 bg-brand-red rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-brand-red rounded-full shadow-md pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-300 mt-1.5">
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-brand-red' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CalculatorWidget() {
  const [gross,           setGross]           = useState(24000)
  const [months,          setMonths]          = useState(10)
  const [isStudent,       setIsStudent]       = useState(false)
  const [homeoffice,      setHomeoffice]      = useState(false)
  const [homeofficeDays,  setHomeofficeDays]  = useState(100)

  const result = useMemo(
    () => calcRefund({ gross, months, isStudent, homeoffice, homeofficeDays }),
    [gross, months, isStudent, homeoffice, homeofficeDays],
  )

  const hasResult = result.refund > 0

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">

      {/* ── LEFT: Inputs ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/60 p-6 md:p-8 space-y-7">

        <div>
          <h2 className="text-lg font-black text-brand-navy mb-0.5">Your details</h2>
          <p className="text-xs text-gray-400">Adjust the values to match your situation</p>
        </div>

        {/* Gross income */}
        <Slider
          label="Total gross income earned in Germany"
          value={gross} min={3000} max={120000} step={500}
          format={v => `€${v.toLocaleString()}`}
          onChange={setGross}
        />

        {/* Months */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-700">Months worked in Germany</label>
            <span className="text-sm font-black text-brand-navy">{months} month{months !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={`h-9 rounded-lg text-xs font-bold transition-all ${
                  m <= months
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {months < 12 && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp size={11} />
              Partial-year workers often get a larger refund!
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-4 pt-1 border-t border-gray-50">
          {/* Student toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <GraduationCap size={14} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Student or part-time worker</p>
                <p className="text-xs text-gray-400 mt-0.5">Eligible for an extra €800 deduction</p>
              </div>
            </div>
            <Toggle checked={isStudent} onChange={setIsStudent} />
          </div>

          {/* Homeoffice toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Home size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Worked from home</p>
                <p className="text-xs text-gray-400 mt-0.5">€6 per day, max €1,260 (Homeoffice-Pauschale)</p>
              </div>
            </div>
            <Toggle checked={homeoffice} onChange={setHomeoffice} />
          </div>

          {homeoffice && (
            <div className="ml-10">
              <Slider
                label="Home-office days"
                value={homeofficeDays} min={10} max={210} step={5}
                format={v => `${v} days`}
                onChange={setHomeofficeDays}
              />
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-[11px] text-gray-400 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>
            Estimate based on German Grundtarif 2024 with standard deductions.
            Actual refund may vary. A full assessment is done when you apply.
          </span>
        </div>
      </div>

      {/* ── RIGHT: Result card ───────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-6 space-y-4">

        {/* Main result */}
        <div className={`rounded-3xl border overflow-hidden shadow-lg transition-all duration-500 ${
          hasResult
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 border-emerald-400/30 shadow-emerald-500/20'
            : 'bg-white border-gray-100 shadow-gray-100/60'
        }`}>
          <div className="p-6 text-center">
            {hasResult ? (
              <>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Banknote size={22} className="text-white" />
                </div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                  Estimated refund
                </p>
                <p className="text-5xl font-black text-white leading-none mb-1">
                  ~€{result.refund.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs mt-2">
                  Range: €{result.refundLow.toLocaleString()} – €{result.refundHigh.toLocaleString()}
                </p>

                {/* Mini stats */}
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <div className="bg-white/15 rounded-xl px-3 py-2.5 text-left">
                    <p className="text-[10px] text-white/60 font-semibold">Tax withheld</p>
                    <p className="text-base font-black text-white">€{result.withheld.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/15 rounded-xl px-3 py-2.5 text-left">
                    <p className="text-[10px] text-white/60 font-semibold">Effective rate</p>
                    <p className="text-base font-black text-white">{result.effectiveRate}%</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6">
                <Briefcase size={28} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Enter your income details to see your estimate</p>
              </div>
            )}
          </div>
        </div>

        {/* Deductions breakdown */}
        {hasResult && result.breakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Deductions applied
            </p>
            <div className="space-y-2">
              {result.breakdown.map(({ label, amount }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-bold text-brand-navy">€{amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-700">Total deductions</span>
                <span className="font-black text-brand-red">−€{result.deductionTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline info */}
        {hasResult && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Timeline</p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Upload documents',     time: '~10 min',    color: 'bg-blue-100 text-blue-600' },
                { label: 'We file with Finanzamt', time: '2–3 days', color: 'bg-violet-100 text-violet-600' },
                { label: 'Refund to your account', time: '3–6 months', color: 'bg-emerald-100 text-emerald-600' },
              ].map(({ label, time, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${color}`}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full bg-brand-red hover:bg-red-500 active:scale-[0.98] text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-brand-red/20"
        >
          {hasResult ? `Claim my ~€${result.refund.toLocaleString()}` : 'Start my application'}
          <ArrowRight size={15} />
        </Link>
        <p className="text-center text-xs text-gray-400">
          Free to start · No upfront payment required
        </p>

        {/* Years reminder */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
          <div className="flex items-start gap-2">
            <Calendar size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-snug">
              <strong>Don&apos;t miss the deadline.</strong> You can claim for 2021, 2022, 2023 and 2024.
              The 2021 window closes at end of 2025.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
