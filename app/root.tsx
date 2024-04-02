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
  useLoaderData,
} from '@remix-run/react'

import tailwindStylesheetUrl from './styles/tailwind.css'
import { getLoggedUserProfile } from './infra/session.server'
import i18next from './infra/i18next.server'
import { useTranslation } from 'react-i18next'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwindStylesheetUrl }]
}

export const meta: MetaFunction = () => [
  {
    title: 'Expensable',
  },
  {
    name: 'viewport',
    content: 'width=device-width,initial-scale=1.0',
  },
]

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request)
  return json({
    user: await getLoggedUserProfile(request),
    locale,
  })
}

export const handle = {
  i18n: 'common',
}

// const timeZone = 'Brazil/East'

export default function App() {
  const { locale } = useLoaderData<typeof loader>()
  const { i18n } = useTranslation()

  return (
    <html
      lang={locale}
      dir={i18n.dir()}
      className="flex min-h-full flex-col"
      data-theme="expensable"
    >
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body className="flex h-full flex-grow flex-col bg-gradient-to-tr from-green-200 via-orange-200 to-red-200">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
