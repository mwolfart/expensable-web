import { useLoaderData } from '@remix-run/react'
import { ActionArgs, json, LoaderArgs } from '@remix-run/server-runtime'
import { useTranslations } from 'use-intl'
import { getUserCategories } from '~/models/user.server'
import { getUserId } from '~/session.server'
import { NoData } from '~/components/no-data'
import { useState } from 'react'
import { cxWithDelayedFade, cxWithGrowMd } from '~/utils'

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
  const [showAddCategory, setAddCategory] = useState(false)

  const addCategoryOuter = cxWithGrowMd(
    'absolute right-0 top-full my-4 w-64 rounded-xl bg-primary',
    showAddCategory,
  )
  const addCategoryInner = cxWithDelayedFade(
    'grid grid-cols-2-grow-left grid-rows-2 gap-4 p-4',
    showAddCategory,
  )

  return (
    <div className="m-8 mt-4 flex flex-grow flex-col gap-8">
      <div className="relative flex gap-4">
        <input
          className="input flex-grow"
          placeholder={t('category.search')}
          aria-label={t('category.search')}
        ></input>
        <button
          className="btn-outline btn-primary btn"
          onClick={() => setAddCategory(true)}
        >
          {t('category.add')}
        </button>
        <div className={addCategoryOuter}>
          <div className={addCategoryInner}>
            <input
              className="input"
              placeholder={t('category.category-name')}
            ></input>
            <button className="btn-secondary btn p-4 text-white">
              {t('common.ok')}
            </button>
            <button
              className="btn col-span-2 text-white hover:border-transparent hover:bg-white hover:text-primary"
              onClick={() => setAddCategory(false)}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
      {!categories.length && (
        <NoData>
          <p>{t('category.try-adding')}</p>
        </NoData>
      )}
      {categories.map((category) => (
        <div>{category.title}</div>
      ))}
    </div>
  )
}
