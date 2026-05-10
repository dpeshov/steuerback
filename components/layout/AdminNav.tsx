'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function AdminNav({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-brand-navy text-white h-14 flex items-center px-4">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <Link href="/admin" className="font-bold text-lg">
            Steuer<span className="text-brand-red">Back</span>
            <span className="ml-2 text-xs bg-brand-red px-2 py-0.5 rounded font-normal">Admin</span>
          </Link>
          <Link href="/admin/applications" className="text-white/70 hover:text-white transition-colors">Applications</Link>
          <Link href="/admin/users" className="text-white/70 hover:text-white transition-colors">Users</Link>
        </div>
        <button onClick={signOut} className="text-sm text-white/70 hover:text-white transition-colors">
          Sign out
        </button>
      </div>
    </header>
  )
}
