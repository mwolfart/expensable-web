import { json, LoaderArgs, redirect } from '@remix-run/node'
import { useLoaderData, useNavigate, useSubmit } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { getUser, getUserId } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (!userId) return redirect('/auth')
  const user = await getUser(request)
  return json(user)
}

export default function Index() {
  const t = useTranslations()
  const user = useLoaderData<typeof loader>()
  const submit = useSubmit()

  return (
    <main className="relative flex h-full flex-col p-8 sm:p-16 sm:pt-4">
      <div className="hidden flex-row justify-end gap-8 p-8 sm:flex">
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
      <div className="flex-grow rounded-2xl bg-foreground"></div>
    </main>
  )
}
