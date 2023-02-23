import { useActionData, useLoaderData } from '@remix-run/react'
import {
  ActionArgs,
  json,
  LoaderArgs,
  TypedResponse,
} from '@remix-run/server-runtime'
import { useTranslations } from 'use-intl'
import { getUserCategories } from '~/models/user.server'
import { getUserId } from '~/session.server'
import {
  getCategoryByTitle,
  createCategory,
  deleteCategory,
  updateCategory,
} from '~/models/category.server'
import { NoData } from '~/components/no-data'
import { useEffect, useState } from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { ErrorCodes } from '~/utils/schemas'
import { CategoryList } from '~/components/category-list'
import { AddCategoryPopup } from '~/components/category-add-popup'
import { timeout } from '~/utils/timeout'

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

export async function action({
  request,
}: ActionArgs): Promise<
  TypedResponse<{ error?: string; success?: boolean; method?: string }>
> {
  const { method } = request
  const res = { method }
  if (method === 'POST') {
    const formData = await request.formData()
    const category = formData.get('category')

    if (typeof category !== 'string' || category === '') {
      return json({ error: ErrorCodes.CATEGORY_EMPTY, ...res }, { status: 400 })
    }

    const existingCategory = await getCategoryByTitle(category)
    if (existingCategory) {
      return json(
        { error: ErrorCodes.CATEGORY_DUPLICATE, ...res },
        { status: 400 },
      )
    }

    try {
      const userId = await getUserId(request)
      if (!userId) {
        return json({ success: false, ...res }, { status: 403 })
      }
      await createCategory(userId, category)
    } catch (_) {
      return json({ success: false, ...res }, { status: 500 })
    }
    return json({ success: true, ...res }, { status: 200 })
  } else if (method === 'DELETE') {
    const formData = await request.formData()
    const id = formData.get('id')

    if (typeof id !== 'string' || id === '') {
      return json({ error: ErrorCodes.INVALID_ID, ...res }, { status: 400 })
    }

    try {
      await deleteCategory(id)
      return json({ success: true, ...res }, { status: 200 })
    } catch (_) {
      return json({ success: false, ...res }, { status: 500 })
    }
  } else if (method === 'PATCH') {
    const formData = await request.formData()
    const id = formData.get('id')
    const title = formData.get('title')

    if (typeof id !== 'string' || id === '') {
      return json({ error: ErrorCodes.INVALID_ID, ...res }, { status: 400 })
    }

    if (typeof title !== 'string' || title === '') {
      return json({ error: ErrorCodes.CATEGORY_EMPTY, ...res }, { status: 400 })
    }

    const existingCategory = await getCategoryByTitle(title)
    if (existingCategory) {
      return json(
        { error: ErrorCodes.CATEGORY_DUPLICATE, ...res },
        { status: 400 },
      )
    }

    try {
      await updateCategory(id, title)
    } catch (_) {
      return json({ success: false, ...res }, { status: 500 })
    }
    return json({ success: true, ...res }, { status: 200 })
  }
  return json({ success: false, ...res }, { status: 405 })
}

export default function Categories() {
  const { categories } = useLoaderData<typeof loader>()
  const t = useTranslations()
  const [showAddCategory, setAddCategory] = useState(false)
  const [showDeleteToast, setShowDeleteToast] = useState(false)

  const renderDeleteToast = async () => {
    setShowDeleteToast(true)
    await timeout(3000)
    setShowDeleteToast(false)
  }

  const DeleteToast = (
    <div className="toast">
      <div className="alert alert-info">{t('category.category-deleted')}</div>
    </div>
  )

  return (
    <div className="m-8 mt-0 flex flex-grow flex-col gap-2 md:mt-4 md:gap-4">
      {showDeleteToast && DeleteToast}
      <div className="relative flex flex-col gap-4 sm:flex-row">
        <input
          className="input flex-grow"
          placeholder={t('category.search')}
          aria-label={t('category.search')}
        ></input>
        <button
          className="btn-primary btn md:btn-outline"
          onClick={() => setAddCategory(true)}
        >
          <div className="block sm:hidden md:block">{t('category.add')}</div>
          <AiOutlinePlus
            className="hidden text-white sm:block md:hidden"
            size={24}
          />
        </button>
        <AddCategoryPopup isOpen={showAddCategory} setOpen={setAddCategory} />
      </div>
      {!categories.length && (
        <NoData>
          <p>{t('category.try-adding')}</p>
        </NoData>
      )}
      <CategoryList
        categories={categories}
        renderDeleteToast={renderDeleteToast}
      />
    </div>
  )
}
