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

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => [
  {
    charset: 'utf-8',
    title: 'Expensable',
    viewport: 'width=device-width,initial-scale=1',
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
  const userLang = typeof navigator !== 'undefined' ? navigator.language : 'en'
  const [language, setLanguage] = useState(userLang)

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
          <LanguageProvider context={{ language, setLanguage }}>
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
