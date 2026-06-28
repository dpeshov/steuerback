'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, FlaskConical, Loader2, AlertTriangle } from 'lucide-react'
import { deleteAllTestData } from './testActions'

export default function DeleteTestData({ counts }: { counts: { users: number; applications: number; leads: number } }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  const total = counts.users + counts.applications + counts.leads
  if (total === 0) return null

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteAllTestData()
      setResult(`Deleted ${res.leads} leads, ${res.applications} applications, ${res.users} users`)
      setShowConfirm(false)
      router.refresh()
      setTimeout(() => setResult(null), 5000)
    })
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
          <FlaskConical size={16} className="text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-brand-navy text-sm">Test Data</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {counts.users} test users, {counts.applications} test applications, {counts.leads} test leads
          </p>

          {result && (
            <p className="text-xs text-emerald-600 font-semibold mt-2">{result}</p>
          )}

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 bg-white border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl transition-colors"
            >
              <Trash2 size={12} /> Delete all test data
            </button>
          ) : (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                <AlertTriangle size={12} /> This will permanently delete {total} test entries. Are you sure?
              </div>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-4 py-2 rounded-xl transition-colors"
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Yes, delete all
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
