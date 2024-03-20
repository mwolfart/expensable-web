import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { i18n } from '~/constants'

import { IntlProvider } from 'use-intl'
import tailwindStylesheetUrl from './styles/tailwind.css'
import { getLoggedUserProfile } from './infra/session.server'
import { useState } from 'react'
import { LanguageProvider } from './presentation/providers/language'

const COOKIE_LANGUAGE = 'expensableCookieLanguage'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => [
  {
    charset: 'utf-8',
    title: 'Expensable',
  },
  {
    name: 'viewport',
    content: 'width=device-width,initial-scale=1.0',
  },
]

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    user: await getLoggedUserProfile(request),
  })
}

const timeZone = 'Brazil/East'

const getLanguage = (lang: string) => {
  switch (lang) {
    default:
    case 'en':
    case 'en-US':
      return i18n.en
    case 'pt-BR':
      return i18n.ptbr
  }
}

export default function App() {
  let userLang = 'en'
  if (
    typeof sessionStorage !== 'undefined' &&
    typeof navigator !== 'undefined'
  ) {
    const cookie = sessionStorage.getItem(COOKIE_LANGUAGE)
    if (!cookie) {
      userLang = navigator.language
      sessionStorage.setItem(COOKIE_LANGUAGE, userLang)
    } else if (cookie) {
      userLang = cookie
    }
  }
  const [language, setLanguage] = useState(userLang)

  const changeLanguage = (lang: string) => {
    sessionStorage.setItem(COOKIE_LANGUAGE, lang)
    setLanguage(lang)
  }

  return (
    <html
      lang="en"
      className="flex min-h-full flex-col"
      data-theme="expensable"
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-grow flex-col bg-gradient-to-tr from-green-200 via-orange-200 to-red-200">
        <IntlProvider
          messages={getLanguage(language)}
          locale="en"
          timeZone={timeZone}
        >
          <LanguageProvider context={{ language, setLanguage: changeLanguage }}>
            <Outlet />
          </LanguageProvider>
        </IntlProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
