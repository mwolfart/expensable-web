import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node'
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

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Expensable',
  viewport: 'width=device-width,initial-scale=1',
})

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getLoggedUserProfile(request),
  })
}

export default function App() {
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
        <IntlProvider messages={i18n.en} locale="en">
          <Outlet />
        </IntlProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
