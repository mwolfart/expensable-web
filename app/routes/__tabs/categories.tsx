import { Form, useActionData, useLoaderData, useSubmit } from '@remix-run/react'
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
} from '~/models/category.server'
import { NoData } from '~/components/no-data'
import { ChangeEvent, useEffect, useState } from 'react'
import { cxFormInput, cxWithDelayedFade, cxWithGrowMd } from '~/utils'
import { AiOutlinePlus } from 'react-icons/ai'
import { BsTrash } from 'react-icons/bs'
import { ErrorCodes } from '~/utils/schemas'
import { timeout } from '~/utils/timeout'
import { useErrorMessages } from '~/hooks'

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
  } else return json({ success: false, ...res }, { status: 405 })
}

export default function Categories() {
  const { categories } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const t = useTranslations()
  const onSubmit = useSubmit()
  const { errorToString } = useErrorMessages()
  const [showAddCategory, setAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [addError, setAddError] = useState<string>()
  const [showAddToast, setShowAddToast] = useState(false)
  const [showDeleteToast, setShowDeleteToast] = useState(false)

  useEffect(() => {
    const foo = async () => {
      if (actionData?.method === 'POST') {
        if (actionData?.error) {
          setAddError(errorToString(actionData.error))
          setNewCategory('')
        } else if (actionData?.success) {
          setAddCategory(false)
          setShowAddToast(true)
          setNewCategory('')
          await timeout(3000)
          setShowAddToast(false)
        }
      } else if (actionData?.method === 'DELETE') {
        setShowDeleteToast(true)
        await timeout(3000)
        setShowDeleteToast(false)
      }
    }
    foo()
  }, [actionData])

  const onCancelAdd = () => {
    setNewCategory('')
    setAddCategory(false)
  }

  const onChangeNewCategory = (evt: ChangeEvent<HTMLInputElement>) => {
    setNewCategory(evt.target.value)
    setAddError(undefined)
  }

  const onDelete = (id: string) => {
    onSubmit({ id }, { method: 'delete' })
  }

  const AddToast = (
    <div className="toast">
      <div className="alert alert-success">{t('category.category-added')}</div>
    </div>
  )
  const DeleteToast = (
    <div className="toast">
      <div className="alert alert-success">
        {t('category.category-deleted')}
      </div>
    </div>
  )
  const addCategoryOuter = cxWithGrowMd(
    'absolute right-0 left-0 sm:left-auto top-full my-4 sm:w-80 rounded-xl bg-primary',
    showAddCategory,
  )
  const addCategoryInner = cxWithDelayedFade(
    'grid grid-cols-2-grow-left grid-rows-2 gap-4 p-4',
    showAddCategory,
  )

  return (
    <div className="m-8 mt-0 flex flex-grow flex-col gap-4 md:mt-4 md:gap-8">
      {showAddToast && AddToast}
      {showDeleteToast && DeleteToast}
      <div className="relative flex gap-4">
        <input
          className="input flex-grow"
          placeholder={t('category.search')}
          aria-label={t('category.search')}
        ></input>
        <button
          className="btn-primary btn md:btn-outline"
          onClick={() => setAddCategory(true)}
        >
          <div className="hidden sm:block">{t('category.add')}</div>
          <AiOutlinePlus className="block text-white sm:hidden" size={28} />
        </button>
        <div className={addCategoryOuter}>
          <Form method="post" className={addCategoryInner}>
            <input
              name="category"
              className={cxFormInput({ hasError: Boolean(addError) })}
              placeholder={addError || t('category.category-name')}
              value={newCategory}
              onChange={onChangeNewCategory}
            ></input>
            <button className="btn-secondary btn p-4 text-white" type="submit">
              {t('common.ok')}
            </button>
            <button
              type="button"
              className="btn col-span-2 text-white hover:border-transparent hover:bg-white hover:text-primary"
              onClick={onCancelAdd}
            >
              {t('common.cancel')}
            </button>
          </Form>
        </div>
      </div>
      {!categories.length && (
        <NoData>
          <p>{t('category.try-adding')}</p>
        </NoData>
      )}
      <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
        {categories.map((category) => (
          <div
            className="flex items-center bg-foreground py-2"
            key={category.id}
          >
            <p className="flex-grow">{category.title}</p>
            <button
              className="btn-ghost btn p-2 text-primary"
              aria-label={t('common.delete')}
              onClick={() => onDelete(category.id)}
            >
              <BsTrash size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
