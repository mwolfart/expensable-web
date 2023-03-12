import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from '@remix-run/server-runtime'
import type { AddExpenseFormErrors, ExpenseWithCategory } from '~/utils/types'
import type { Category } from '@prisma/client'
import { useTranslations } from 'use-intl'
import { AiOutlinePlus } from 'react-icons/ai'
import { BiFilterAlt } from 'react-icons/bi'
import {
  countUserExpenses,
  countUserExpensesByFilter,
  createExpense,
  deleteExpense,
  getUserExpenses,
  getUserExpensesByFilter,
  updateExpense,
} from '~/models/expenses.server'
import { getUserId } from '~/session.server'
import { NoData } from '~/components/no-data'
import { ExpenseList } from '~/components/expense-list'
import { typedjson } from 'remix-typedjson'
import { useTypedLoaderData } from 'remix-typedjson/dist/remix'
import { useContext, useEffect, useMemo, useState } from 'react'
import { DialogContext } from '~/providers/dialog'
import { UpsertExpenseDialog } from '~/components/expense-upsert-dialog'
import { ErrorCodes } from '~/utils/schemas'
import {
  areAllValuesEmpty,
  cxWithGrowFadeLg,
  parseCategoryInput,
} from '~/utils'
import { timeout } from '~/utils/timeout'
import { useFetcher, useRevalidator, useSearchParams } from '@remix-run/react'
import cx from 'classnames'
import { ExpenseFilterComponent } from '~/components/expense-filters'
import { usePagination } from '~/hooks/use-pagination'
import { useFilter } from '~/hooks/use-filter'
import { PaginationButtons } from '~/components/pagination-buttons'
import { MobileCancelDialog } from '~/components/mobile-cancel-dialog'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') as string)
    const offset = parseInt(url.searchParams.get('offset') as string)
    const filter = {
      title: url.searchParams.get('title'),
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
      categoriesIds: url.searchParams.get('categories'),
    }
    if (!areAllValuesEmpty(filter)) {
      const parsedFilter = {
        title: filter.title,
        startDate: filter.startDate ? new Date(filter.startDate) : null,
        endDate: filter.endDate ? new Date(filter.endDate) : null,
        categoriesIds: filter.categoriesIds?.split(','),
      }
      const count = await countUserExpensesByFilter(userId, parsedFilter)
      const data = await getUserExpensesByFilter(
        userId,
        parsedFilter,
        offset,
        limit,
      )
      if (data) {
        return typedjson({ expenses: data, total: count })
      }
    } else {
      const count = await countUserExpenses(userId)
      const data = await getUserExpenses(userId, offset, limit)
      if (data) {
        return typedjson({ expenses: data, total: count })
      }
    }
  }
  return typedjson({ expenses: [], total: 0 })
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
  if (method === 'PUT') {
    const formData = await request.formData()
    const id = formData.get('id')
    const name = formData.get('name')
    const amount = formData.get('amount')
    const unit = formData.get('unit')
    const date = formData.get('date')
    const categories = formData.get('categories')

    if (typeof name !== 'string' || !name.length) {
      return typedjson(
        { errors: { name: ErrorCodes.NAME_REQUIRED }, ...res },
        { status: 400 },
      )
    }

    if (typeof amount !== 'string' || !amount.length) {
      return typedjson(
        { errors: { amount: ErrorCodes.AMOUNT_REQUIRED }, ...res },
        { status: 400 },
      )
    }

    if (typeof unit !== 'string') {
      return typedjson(
        { errors: { unit: ErrorCodes.BAD_FORMAT }, ...res },
        { status: 400 },
      )
    }

    if (typeof date !== 'string' || isNaN(Date.parse(date))) {
      return typedjson(
        { errors: { date: ErrorCodes.BAD_DATE_FORMAT }, ...res },
        { status: 400 },
      )
    }

    if (typeof categories !== 'undefined' && typeof categories !== 'string') {
      return typedjson(
        { errors: { categories: ErrorCodes.BAD_CATEGORY_DATA }, ...res },
        { status: 400 },
      )
    }

    let parsedCategories
    if (typeof categories === 'string') {
      try {
        parsedCategories = parseCategoryInput(categories)
      } catch (_) {
        return typedjson(
          { errors: { categories: ErrorCodes.BAD_CATEGORY_DATA }, ...res },
          { status: 400 },
        )
      }
    }

    try {
      const userId = await getUserId(request)
      if (!userId) {
        return typedjson({ success: false, ...res }, { status: 403 })
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
      return typedjson({ success: false, ...res }, { status: 500 })
    }
    return typedjson({ success: true, ...res }, { status: 200 })
  }
  if (method === 'DELETE') {
    const formData = await request.formData()
    const id = formData.get('id')
    if (typeof id !== 'string' || id === '') {
      return typedjson(
        { errors: { categories: ErrorCodes.INVALID_ID }, ...res },
        { status: 400 },
      )
    }

    try {
      await deleteExpense(id)
    } catch (e) {
      return typedjson({ success: false, ...res }, { status: 500 })
    }
    return typedjson({ success: true, ...res }, { status: 200 })
  }
  return typedjson({ success: false, ...res }, { status: 405 })
}

export default function Expenses() {
  const { expenses, total } = useTypedLoaderData<typeof loader>()
  const t = useTranslations()
  const categoryFetcher = useFetcher()
  const revalidator = useRevalidator()

  const [params] = useSearchParams()
  const [startDate, endDate] = [params.get('startDate'), params.get('endDate')]
  const appliedFilters = {
    title: params.get('title'),
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    categoriesIds: params.get('categoriesIds')?.split(','),
  }

  const { openDialog } = useContext(DialogContext)
  const [categories, setCategories] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showUpsertToast, setShowUpsertToast] = useState(false)
  const [showDeletedToast, setShowDeletedToast] = useState(false)
  const [upsertText, setUpsertText] = useState('')
  const categoryMap = useMemo(() => new Map<string, string>(), [])

  const pagination = usePagination({ url: '/expenses', total })
  const filter = useFilter({ url: '/expenses' })

  useEffect(() => {
    if (categoryFetcher.state === 'idle' && !categoryFetcher.data) {
      categoryFetcher.load('/categories')
    }
  }, [categoryFetcher])

  useEffect(() => {
    if (categoryFetcher.data?.categories) {
      const fetchedCategories = categoryFetcher.data.categories as Category[]
      setCategories(fetchedCategories)
      categoryMap.clear()
      fetchedCategories.forEach(({ id, title }) => {
        categoryMap.set(id, title)
      })
    }
  }, [categoryFetcher.data, categoryMap])

  const onExpenseUpserted = async (updated?: boolean) => {
    setUpsertText(updated ? t('expenses.saved') : t('expenses.created'))
    revalidator.revalidate()
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

  const cxFilterButton = cx(
    'btn-primary btn transition',
    !filter.isFilterApplied && 'btn-outline',
  )

  const FiltersBlock = (
    <ExpenseFilterComponent
      onApplyFilters={filter.onApplyFilters}
      onClearFilters={filter.onClearFilters}
      categories={categories}
      categoryMap={categoryMap}
      initialFilters={appliedFilters}
    />
  )

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
    <div className="m-8 mt-0 md:mt-4">
      {showUpsertToast && UpsertToast}
      {showDeletedToast && DeletedToast}
      {showFilters && (
        <MobileCancelDialog
          content={FiltersBlock}
          onClose={() => setShowFilters(false)}
        />
      )}
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-4">
          <button
            className={cxFilterButton}
            aria-label={t('common.filters')}
            onClick={() => setShowFilters(!showFilters)}
          >
            <BiFilterAlt size={24} />
          </button>
          <label>
            {t('common.entries')}
            <select
              className="input"
              onChange={pagination.onChangeLimit}
              defaultValue={params.get('limit') || 50}
            >
              <option id="10">10</option>
              <option id="20">20</option>
              <option id="50">50</option>
              <option id="100">100</option>
            </select>
          </label>
        </div>
        <button className="btn-primary btn" onClick={onAddExpense}>
          <div className="hidden sm:block">{t('expenses.add')}</div>
          <AiOutlinePlus className="block text-white sm:hidden" size={24} />
        </button>
      </div>
      <div className={cxWithGrowFadeLg('hidden md:block', showFilters)}>
        {FiltersBlock}
      </div>
      {!expenses.length && (
        <NoData>
          <p>{t('expenses.try-adding')}</p>
        </NoData>
      )}
      {!!expenses.length && (
        <>
          <ExpenseList
            expenses={expenses}
            renderDeleteToast={onExpenseDeleted}
            renderEditDialog={onEditExpense}
            categoryMap={categoryMap}
          />
          <PaginationButtons total={total} {...pagination} />
        </>
      )}
    </div>
  )
}
