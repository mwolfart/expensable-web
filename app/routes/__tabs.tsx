import { json, LoaderArgs, redirect } from '@remix-run/node'
import { Outlet, useLoaderData, useLocation, useSubmit } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { DialogProvider } from '~/providers/dialog'
import { getUser, getUserId } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (!userId) return redirect('/login')
  const user = await getUser(request)
  return json(user)
}

export default function Index() {
  const t = useTranslations()
  const user = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const { pathname } = useLocation()

  const getTabClass = (path: string) =>
    `btn normal-case ${
      path === pathname
        ? 'btn-primary'
        : 'btn-ghost text-primary hover:bg-primary hover:text-white'
    }`

  return (
    <DialogProvider>
      <main className="relative flex h-full flex-col p-8 sm:p-16 sm:pt-0">
        <div className="hidden flex-row justify-end gap-8 p-4 sm:flex">
          <p className="flex items-center text-sm text-primary">
            {t('home.logged-in-as', { user: user?.fullName })}
          </p>
          <div className="text-primary" aria-hidden={true}>
            |
          </div>
          <button
            className="btn-link btn px-0 text-sm"
            onClick={() => submit(null, { action: 'logout', method: 'post' })}
          >
            {t('common.logout')}
          </button>
        </div>
        <div className="flex flex-grow flex-col rounded-2xl bg-foreground">
          <div className="tabs gap-4 p-4">
            <a className={getTabClass('/')} href="/">
              {t('home.dashboard')}
            </a>
            <a className={getTabClass('/expenses')} href="/expenses">
              {t('home.expenses')}
            </a>
            <a className={getTabClass('/categories')} href="/categories">
              {t('home.categories')}
            </a>
            <a className={getTabClass('/supermarket')} href="/supermarket">
              {t('home.supermarket')}
            </a>
          </div>
          <Outlet />
        </div>
      </main>
    </DialogProvider>
  )
}
