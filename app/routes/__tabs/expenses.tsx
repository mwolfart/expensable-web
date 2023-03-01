import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from '@remix-run/server-runtime'
import type { AddExpenseFormErrors, ExpenseWithCategory } from '~/utils/types'
import type { Category } from '@prisma/client'
import { json } from '@remix-run/server-runtime'
import { useTranslations } from 'use-intl'
import { AiOutlinePlus } from 'react-icons/ai'
import { BiFilterAlt } from 'react-icons/bi'
import {
  createExpense,
  deleteExpense,
  getUserExpenses,
  updateExpense,
} from '~/models/expenses.server'
import { getUserId } from '~/session.server'
import { NoData } from '~/components/no-data'
import { ExpenseList } from '~/components/expense-list'
import { typedjson } from 'remix-typedjson'
import { useTypedLoaderData } from 'remix-typedjson/dist/remix'
import { useContext, useEffect, useMemo, useState } from 'react'
import { DialogContext } from '~/providers/dialog'
import { UpsertExpenseDialog } from '~/components/expense-add-dialog'
import { ErrorCodes } from '~/utils/schemas'
import { parseCategoryInput } from '~/utils'
import { timeout } from '~/utils/timeout'
import { useFetcher } from '@remix-run/react'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) {
    const data = await getUserExpenses(userId)
    if (data) {
      return typedjson({ expenses: data.expenses })
    }
  }
  return typedjson({ expenses: [] })
}

export async function action({ request }: ActionArgs): Promise<
  TypedResponse<{
    errors?: AddExpenseFormErrors
    success?: boolean
    method?: string
  }>
> {
  const { method } = request
  const res = { method }
  if (method === 'POST') {
    const formData = await request.formData()
    const id = formData.get('id')
    const name = formData.get('name')
    const amount = formData.get('amount')
    const unit = formData.get('unit')
    const date = formData.get('date')
    const categories = formData.get('categories')

    if (typeof name !== 'string' || !name.length) {
      return json(
        { errors: { name: ErrorCodes.NAME_REQUIRED }, ...res },
        { status: 400 },
      )
    }

    if (typeof amount !== 'string' || !amount.length) {
      return json(
        { errors: { amount: ErrorCodes.AMOUNT_REQUIRED }, ...res },
        { status: 400 },
      )
    }

    if (typeof unit !== 'string') {
      return json(
        { errors: { unit: ErrorCodes.BAD_FORMAT }, ...res },
        { status: 400 },
      )
    }

    if (typeof date !== 'string' || isNaN(Date.parse(date))) {
      return json(
        { errors: { date: ErrorCodes.BAD_DATE_FORMAT }, ...res },
        { status: 400 },
      )
    }

    if (typeof categories !== 'undefined' && typeof categories !== 'string') {
      return json(
        { errors: { categories: ErrorCodes.BAD_CATEGORY_DATA }, ...res },
        { status: 400 },
      )
    }

    let parsedCategories
    if (typeof categories === 'string') {
      try {
        parsedCategories = parseCategoryInput(categories)
      } catch (_) {
        return json(
          { errors: { categories: ErrorCodes.BAD_CATEGORY_DATA }, ...res },
          { status: 400 },
        )
      }
    }

    try {
      const userId = await getUserId(request)
      if (!userId) {
        return json({ success: false, ...res }, { status: 403 })
      }

      if (typeof id === 'string' && id !== '') {
        await updateExpense(
          {
            id,
            title: name,
            amount: parseFloat(amount.replace(/[^0-9]/g, '')),
            unit: parseFloat(unit.replace(/[^0-9]/g, '')),
            datetime: new Date(Date.parse(date)),
            userId,
          },
          parsedCategories,
        )
      } else {
        await createExpense(
          {
            title: name,
            amount: parseFloat(amount.replace(/[^0-9]/g, '')),
            unit: parseFloat(unit.replace(/[^0-9]/g, '')),
            datetime: new Date(Date.parse(date)),
            userId,
          },
          parsedCategories,
        )
      }
    } catch (e) {
      return json({ success: false, ...res }, { status: 500 })
    }

    return json({ success: true, ...res }, { status: 200 })
  }
  if (method === 'DELETE') {
    const formData = await request.formData()
    const id = formData.get('id')
    if (typeof id !== 'string' || id === '') {
      return json(
        { errors: { categories: ErrorCodes.INVALID_ID }, ...res },
        { status: 400 },
      )
    }

    try {
      await deleteExpense(id)
    } catch (e) {
      return json({ success: false, ...res }, { status: 500 })
    }
    return json({ success: true, ...res }, { status: 200 })
  }
  return json({ success: false, ...res }, { status: 405 })
}

export default function Expenses() {
  const { expenses } = useTypedLoaderData<typeof loader>()
  const t = useTranslations()
  const { openDialog } = useContext(DialogContext)
  const categoryFetcher = useFetcher()
  const [categories, setCategories] = useState<Category[]>([])
  const [showUpsertToast, setShowUpsertToast] = useState(false)
  const [showDeletedToast, setShowDeletedToast] = useState(false)
  const [upsertText, setUpsertText] = useState('')

  useEffect(() => {
    if (categoryFetcher.state === 'idle' && !categoryFetcher.data) {
      categoryFetcher.load('/categories')
    }
  }, [categoryFetcher])

  useEffect(() => {
    if (categoryFetcher.data?.categories) {
      setCategories(categoryFetcher.data.categories)
    }
  }, [categoryFetcher.data])

  const categoryMap = useMemo(() => new Map<string, string>(), [])
  useEffect(() => {
    categoryMap.clear()
    categories.forEach(({ id, title }) => {
      categoryMap.set(id, title)
    })
  }, [categories, categoryMap])

  const onExpenseUpserted = async (updated?: boolean) => {
    setUpsertText(updated ? t('expenses.created') : t('expenses.saved'))
    setShowUpsertToast(true)
    await timeout(3000)
    setShowUpsertToast(false)
  }

  const onAddExpense = () => {
    openDialog(
      <UpsertExpenseDialog
        onUpserted={onExpenseUpserted}
        categories={categories}
        categoryMap={categoryMap}
      />,
    )
  }

  const onExpenseDeleted = async () => {
    setShowDeletedToast(true)
    await timeout(3000)
    setShowDeletedToast(false)
  }

  const onEditExpense = (expense: ExpenseWithCategory) => {
    openDialog(
      <UpsertExpenseDialog
        onUpserted={() => onExpenseUpserted(true)}
        categories={categories}
        categoryMap={categoryMap}
        initialData={expense}
      />,
    )
  }

  const UpsertToast = (
    <div className="toast">
      <div className="alert alert-success">{upsertText}</div>
    </div>
  )

  const DeletedToast = (
    <div className="toast">
      <div className="alert alert-info">{t('expenses.deleted')}</div>
    </div>
  )

  return (
    <div className="m-8 mt-0 flex flex-grow flex-col gap-2 md:mt-4 md:gap-4">
      {showUpsertToast && UpsertToast}
      {showDeletedToast && DeletedToast}
      <div className="flex justify-between">
        <button
          className="btn-outline btn-primary btn"
          aria-label={t('common.filters')}
        >
          <BiFilterAlt size={24} />
        </button>
        <button className="btn-primary btn" onClick={onAddExpense}>
          <div className="hidden sm:block">{t('expenses.add')}</div>
          <AiOutlinePlus className="block text-white sm:hidden" size={24} />
        </button>
      </div>
      {!expenses.length && (
        <NoData>
          <p>{t('expenses.try-adding')}</p>
        </NoData>
      )}
      <ExpenseList
        expenses={expenses}
        renderDeleteToast={onExpenseDeleted}
        renderEditDialog={onEditExpense}
        categoryMap={categoryMap}
      />
    </div>
  )
}
