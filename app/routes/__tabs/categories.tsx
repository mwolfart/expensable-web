import { useLoaderData } from '@remix-run/react'
import { ActionArgs, json, LoaderArgs } from '@remix-run/server-runtime'
import { useTranslations } from 'use-intl'
import { getUserCategories } from '~/models/user.server'
import { getUserId } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) {
    const data = await getUserCategories(userId)
    if (data) {
      return json({ categories: data.categories })
    }
  }
  return json({ categories: [] })
}

export async function action({ request }: ActionArgs) {}

export default function Categories() {
  const { categories } = useLoaderData<typeof loader>()
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-4 p-8 pt-4">
      <div className="flex gap-4">
        <input
          className="input flex-grow"
          placeholder={t('category.search')}
          aria-label={t('category.search')}
        ></input>
        <button className="btn-primary btn">{t('category.add')}</button>
      </div>
    </div>
  )
}
