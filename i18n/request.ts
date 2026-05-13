import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const LOCALES = ['en', 'de', 'mk', 'sr', 'bs', 'sq', 'tr', 'hi', 'ne'] as const
export type Locale = (typeof LOCALES)[number]

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('locale')?.value ?? 'en'
  const locale = (LOCALES.includes(raw as Locale) ? raw : 'en') as Locale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
