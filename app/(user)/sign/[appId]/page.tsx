import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ShieldCheck, User, Calendar, MapPin, FileText } from 'lucide-react'
import SignatureCanvas from './SignatureCanvas'

export default async function SignVollmachtPage({
  params,
}: {
  params: Promise<{ appId: string }>
}) {
  const { appId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: app } = await supabase
    .from('applications')
    .select('id, tax_year, status, user_id')
    .eq('id', appId)
    .eq('user_id', user.id)
    .single()

  if (!app) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, date_of_birth, nationality, address, city, country_of_residence, passport_number, tax_id')
    .eq('user_id', user.id)
    .single()

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—'
  const dob = profile?.date_of_birth
    ? new Date(profile.date_of_birth).toLocaleDateString('en-GB')
    : '—'
  const address = [profile?.address, profile?.city, profile?.country_of_residence].filter(Boolean).join(', ') || '—'

  return (
    <div className="max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-brand-red/10 flex items-center justify-center">
          <FileText size={18} className="text-brand-red" />
        </div>
        <div>
          <h1 className="text-xl font-black text-brand-navy">Power of Attorney</h1>
          <p className="text-sm text-gray-400">Vollmacht — Tax Year {app.tax_year}</p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={14} className="text-brand-red" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Document Preview</span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          I, <strong className="text-brand-navy">{fullName}</strong>, authorize{' '}
          <strong className="text-brand-navy">SteuerBack</strong> to represent me in all tax
          matters before the German Finanzamt for the{' '}
          <strong className="text-brand-navy">{app.tax_year}</strong> tax year.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
          <InfoRow icon={User} label="Full name" value={fullName} />
          <InfoRow icon={Calendar} label="Date of birth" value={dob} />
          <InfoRow icon={MapPin} label="Address" value={address} />
          <InfoRow icon={FileText} label="Passport / ID" value={profile?.passport_number || '—'} />
        </div>

        {(!profile?.first_name || !profile?.last_name || !profile?.date_of_birth) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-amber-700">
              ⚠ Some profile fields are incomplete. Please{' '}
              <a href="/profile" className="underline">complete your profile</a>{' '}
              before signing.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-400 leading-relaxed pt-1 border-t border-gray-50">
          This authorization includes: filing your income tax return (Einkommensteuererklärung),
          receiving tax assessments, and communicating with the Finanzamt on your behalf.
          The signed PDF will be automatically uploaded to your documents.
        </div>
      </div>

      {/* Signature section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <SignatureCanvas applicationId={app.id} taxYear={app.tax_year} />
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <Icon size={9} />
        {label}
      </div>
      <div className="text-sm font-semibold text-brand-navy truncate">{value}</div>
    </div>
  )
}
