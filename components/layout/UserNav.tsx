'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function UserNav({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-brand-navy text-white h-14 flex items-center px-4">
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">
          Steuer<span className="text-brand-red">Back</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden md:block text-white/60 truncate max-w-48">{user.email}</span>
          <button onClick={signOut} className="text-white/70 hover:text-white transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
