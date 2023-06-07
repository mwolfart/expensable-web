import type { LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Outlet, useLoaderData, useLocation, useSubmit } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { DialogProvider } from '~/providers/dialog'
import { getUser, getUserId } from '~/session.server'
import { MdOutlineCategory } from 'react-icons/md'
import { GoCreditCard, GoGraph } from 'react-icons/go'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { CategoryProvider } from '~/providers/category'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (!userId) {
    return redirect('/login')
  }
  const user = await getUser(request)
  return json(user)
}

export default function Index() {
  const t = useTranslations()
  const user = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const { pathname } = useLocation()

  const getTabClass = (path: string) =>
    `btn normal-case px-2 xs:px-3 sm:px-4 ${
      path === pathname
        ? 'btn-primary'
        : 'btn-ghost text-primary hover:bg-primary hover:text-white'
    }`

  return (
    <CategoryProvider>
      <DialogProvider>
        <main className="relative flex h-full flex-grow flex-col p-8 sm:p-16 sm:pt-0">
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
                <div className="hidden md:block">{t('home.dashboard')}</div>
                <GoGraph className="block md:hidden" size={24} />
              </a>
              <a className={getTabClass('/expenses')} href="/expenses">
                <div className="hidden md:block">{t('home.expenses')}</div>
                <GoCreditCard className="block md:hidden" size={24} />
              </a>
              <a className={getTabClass('/categories')} href="/categories">
                <div className="hidden md:block">{t('home.categories')}</div>
                <MdOutlineCategory className="block md:hidden" size={24} />
              </a>
              <a className={getTabClass('/transactions')} href="/transactions">
                <div className="hidden md:block">{t('home.transactions')}</div>
                <AiOutlineShoppingCart className="block md:hidden" size={24} />
              </a>
            </div>
            <Outlet />
          </div>
        </main>
      </DialogProvider>
    </CategoryProvider>
  )
}
