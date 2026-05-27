import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureReferralCode } from '@/app/actions/referral'
import ReferralCopyButton from './ReferralCopyButton'
import {
  Gift, Users, CheckCircle, Clock, CreditCard, Star,
  TrendingUp, Share2,
} from 'lucide-react'

const STATUS_CONFIG = {
  registered: { label: 'Signed up',        icon: Clock,        color: 'text-gray-500',    bg: 'bg-gray-100' },
  applied:    { label: 'Started app',       icon: TrendingUp,   color: 'text-blue-600',    bg: 'bg-blue-50' },
  paid:       { label: 'Paid',              icon: CreditCard,   color: 'text-violet-600',  bg: 'bg-violet-50' },
  completed:  { label: 'Completed ✓',       icon: Star,         color: 'text-emerald-600', bg: 'bg-emerald-50' },
} as const

const REWARD_PER_COMPLETED = 10_00 // €10 in cents

export default async function ReferralsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ensure the user has a referral code (generates one if needed)
  const code = await ensureReferralCode()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://steuerback.com'
  const referralUrl = `${appUrl}/register?ref=${code}`

  // Load referrals
  const admin = createAdminClient()
  const { data: referrals } = await admin
    .from('referrals')
    .select('*')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  const total     = referrals?.length ?? 0
  const completed = referrals?.filter(r => r.status === 'completed').length ?? 0
  const paid      = referrals?.filter(r => r.status === 'paid').length ?? 0
  const pending   = total - completed
  const earned    = completed * (REWARD_PER_COMPLETED / 100)

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-0.5">Referrals</p>
        <h1 className="text-2xl font-black text-brand-navy">Invite friends, earn rewards</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Earn <strong className="text-brand-navy">€10</strong> for every friend who completes their tax refund through SteuerBack.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift size={16} className="text-brand-red" />
          <h2 className="font-bold text-brand-navy text-sm">How it works</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { step: '1', icon: Share2,       title: 'Share your link',      desc: 'Send your unique invite link to friends' },
            { step: '2', icon: Users,        title: 'Friend signs up',       desc: 'They register and submit their tax return' },
            { step: '3', icon: CheckCircle,  title: 'You earn €10',          desc: 'Credited when their refund is completed' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-10 h-10 bg-brand-red/10 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
                <Icon size={17} className="text-brand-red" />
              </div>
              <p className="text-xs font-black text-brand-navy mb-1">{title}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your link */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Share2 size={14} className="text-brand-red" />
          <h2 className="font-bold text-brand-navy text-sm">Your referral link</h2>
        </div>
        <ReferralCopyButton url={referralUrl} />
        <p className="text-[11px] text-gray-400 mt-2.5">
          Your code: <span className="font-mono font-bold text-brand-navy">{code}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total invited',  value: String(total),    icon: Users,         bg: 'bg-blue-50',    color: 'text-blue-500' },
          { label: 'Completed',      value: String(completed),icon: CheckCircle,   bg: 'bg-emerald-50', color: 'text-emerald-500' },
          { label: 'Earned',         value: `€${earned}`,     icon: Gift,          bg: 'bg-purple-50',  color: 'text-purple-500' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-black text-brand-navy">{value}</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Referrals list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy text-sm">Your referrals</h2>
          {pending > 0 && (
            <span className="text-xs font-semibold text-gray-400">{pending} pending</span>
          )}
        </div>

        {(referrals?.length ?? 0) === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-gray-300" />
            </div>
            <p className="font-bold text-brand-navy mb-1 text-sm">No referrals yet</p>
            <p className="text-xs text-gray-400 max-w-[200px] mx-auto leading-relaxed">
              Share your link with friends who worked in Germany and could benefit from a tax refund.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {referrals!.map(ref => {
              const cfg = STATUS_CONFIG[ref.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.registered
              const Icon = cfg.icon
              return (
                <div key={ref.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-9 h-9 ${cfg.bg} rounded-full flex items-center justify-center shrink-0`}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-navy truncate">
                      {ref.referred_email ?? 'Anonymous'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(ref.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {ref.status === 'completed' && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">+€{REWARD_PER_COMPLETED / 100}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Terms */}
      <p className="text-[11px] text-center text-gray-300 leading-relaxed pb-2">
        Reward is credited as account balance after the referred friend&apos;s refund is marked completed.
        SteuerBack reserves the right to withhold rewards for suspicious activity.
      </p>
    </div>
  )
}
