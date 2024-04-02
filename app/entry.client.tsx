import { RemixBrowser } from '@remix-run/react'
import { startTransition, StrictMode } from 'react'
import i18next from 'i18next'
import { hydrate } from 'react-dom'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { getInitialNamespaces } from 'remix-i18next/client'
import i18n from './constants/i18n'

const LANG_COOKIE = 'expensable_i18nextLng'

async function doHydrate() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(Backend)
    .init({
      ...i18n,

      ns: getInitialNamespaces(),
      backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      detection: {
        order: ['sessionStorage', 'htmlTag'],
        lookupSessionStorage: LANG_COOKIE,
        caches: ['sessionStorage'],
      },
    })

  startTransition(() => {
    hydrate(
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>,
      document,
    )
  })
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(doHydrate)
} else {
  window.setTimeout(doHydrate, 1)
}
