/* eslint-disable react-refresh/only-export-components -- provider, hook, and the fill helper are one i18n module on purpose */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { id } from './id'
import type { Dictionary } from './id'
import { en } from './en'

export type Lang = 'id' | 'en'

const dictionaries: Record<Lang, Dictionary> = { id, en }
const STORAGE_KEY = 'target-coffee-lang'

interface I18nValue {
  lang: Lang
  copy: Dictionary
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const I18nContext = createContext<I18nValue | null>(null)

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'id'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'id' || stored === 'en') return stored
  // The cafe is in Jakarta Barat and the copy is written in Indonesian first.
  // English is one tap away, not a guess based on the browser locale.
  return 'id'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = dictionaries[lang].meta.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', dictionaries[lang].meta.description)
    window.localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggleLang = useCallback(() => setLangState((current) => (current === 'id' ? 'en' : 'id')), [])

  const value = useMemo<I18nValue>(
    () => ({ lang, copy: dictionaries[lang], setLang, toggleLang }),
    [lang, setLang, toggleLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}

export type { Dictionary }
