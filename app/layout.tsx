import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { LOCALES } from '@/i18n/request'
import './globals.css'

export const metadata: Metadata = {
  title: 'SteuerBack — Your German Tax Refund',
  description: 'Get your German tax refund. Simple, fast, trusted. For international students and workers.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SteuerBack',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const raw = cookieStore.get('locale')?.value ?? 'en'
  const locale = LOCALES.includes(raw as (typeof LOCALES)[number]) ? raw : 'en'
  let messages: Record<string, unknown> = {}
  try {
    messages = (await import(`../messages/${locale}.json`)).default
  } catch {
    try {
      messages = (await import('../messages/en.json')).default
    } catch { /* no-op */ }
  }

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
