import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from '@remix-run/server-runtime'
import type { AddExpenseFormErrors, ExpenseWithCategory } from '~/utils/types'
import { useTranslations } from 'use-intl'
import { AiOutlinePlus } from 'react-icons/ai'
import {
  countUserExpenses,
  countUserExpensesByFilter,
  countUserExpensesByIds,
  createExpense,
  deleteExpense,
  getUserExpenses,
  getUserExpensesByFilter,
  getUserExpensesByIds,
  updateExpense,
} from '~/models/expenses.server'
import { getLoggedUserId } from '~/infra/session.server'
import { NoData } from '~/components/no-data'
import { ExpenseList } from '~/components/expense-list'
import { typedjson } from 'remix-typedjson'
import { useTypedLoaderData } from 'remix-typedjson/dist/remix'
import { useContext, useState } from 'react'
import { DialogContext } from '~/providers/dialog'
import { UpsertExpenseDialog } from '~/components/expense-upsert-dialog'
import { ErrorCodes } from '~/utils/schemas'
import {
  areAllValuesEmpty,
  cxWithGrowFadeLg,
  parseCategoryInput,
} from '~/utils'
import { timeout } from '~/utils/timeout'
import { useRevalidator, useSearchParams } from '@remix-run/react'
import { ExpenseFilterComponent } from '~/components/expense-filters'
import { usePagination } from '~/hooks/use-pagination'
import { useFilter } from '~/hooks/use-filter'
import { PaginationButtons } from '~/components/pagination-buttons'
import { MobileCancelDialog } from '~/components/mobile-cancel-dialog'
import { Toast } from '~/components/toast'
import { PaginationLimitSelect } from '~/components/pagination-limit-select'
import { FilterButton } from '~/components/filter-button'

const MAX_INSTALLMENTS = 36

export async function loader({ request }: LoaderArgs) {
  const userId = await getLoggedUserId(request)
  if (userId) {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') as string)
    const offset = parseInt(url.searchParams.get('offset') as string)
    const ids = url.searchParams.get('ids')?.split(',')

    if (ids) {
      const count = await countUserExpensesByIds(userId, ids)
      const data = await getUserExpensesByIds(userId, ids, 0, limit)
      return typedjson({ expenses: data, total: count })
    }

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
    const installments = formData.get('installments')
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

    if (
      typeof installments !== 'string' ||
      isNaN(parseInt(installments)) ||
      parseInt(installments) > MAX_INSTALLMENTS
    ) {
      return typedjson(
        { errors: { installments: ErrorCodes.BAD_FORMAT }, ...res },
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
      const userId = await getLoggedUserId(request)
      if (!userId) {
        return typedjson({ success: false, ...res }, { status: 403 })
      }

      if (typeof id === 'string' && id !== '') {
        await updateExpense(
          {
            id,
            title: name,
            amount: parseFloat(amount.replace(/[^0-9.]/g, '')),
            unit: unit ? parseFloat(unit.replace(/[^0-9.]/g, '')) : null,
            datetime: new Date(Date.parse(date)),
            installments: parseInt(installments),
            userId,
          },
          parsedCategories,
        )
      } else {
        await createExpense(
          {
            title: name,
            amount: parseFloat(amount.replace(/[^0-9.]/g, '')),
            unit: unit ? parseFloat(unit.replace(/[^0-9.]/g, '')) : null,
            datetime: new Date(Date.parse(date)),
            installments: parseInt(installments),
            userId,
          },
          parsedCategories,
        )
      }
    } catch (e) {
      return typedjson(
        { success: false, message: JSON.stringify(e), ...res },
        { status: 500 },
      )
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
      return typedjson(
        { success: false, message: JSON.stringify(e), ...res },
        { status: 500 },
      )
    }
    return typedjson({ success: true, ...res }, { status: 200 })
  }
  return typedjson({ success: false, ...res }, { status: 405 })
}

export default function Expenses() {
  const { expenses, total } = useTypedLoaderData<typeof loader>()
  const t = useTranslations()
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
  const [showFilters, setShowFilters] = useState(false)
  const [showUpsertToast, setShowUpsertToast] = useState(false)
  const [showDeletedToast, setShowDeletedToast] = useState(false)
  const [upsertText, setUpsertText] = useState('')

  const pagination = usePagination({ url: '/expenses', total })
  const filter = useFilter({ url: '/expenses' })

  const onExpenseUpserted = async (updated?: boolean) => {
    setUpsertText(updated ? t('expenses.saved') : t('expenses.created'))
    revalidator.revalidate()
    setShowUpsertToast(true)
    await timeout(3000)
    setShowUpsertToast(false)
  }

  const onAddExpense = () => {
    openDialog(<UpsertExpenseDialog onUpserted={onExpenseUpserted} />)
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
        initialData={expense}
      />,
    )
  }

  const FiltersBlock = (
    <ExpenseFilterComponent
      onApplyFilters={filter.onApplyFilters}
      onClearFilters={filter.onClearFilters}
      initialFilters={appliedFilters}
    />
  )

  return (
    <div className="m-4 mt-0 md:mt-4 md:m-8">
      {showUpsertToast && (
        <Toast message={upsertText} severity="alert-success" />
      )}
      {showDeletedToast && (
        <Toast message={t('expenses.deleted')} severity="alert-info" />
      )}
      {showFilters && (
        <MobileCancelDialog
          content={FiltersBlock}
          onClose={() => setShowFilters(false)}
        />
      )}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:gap-0 sm:items-end">
        <div className="flex items-end gap-4">
          <FilterButton
            onClick={() => setShowFilters(!showFilters)}
            isFilterApplied={filter.isFilterApplied}
          />
          <PaginationLimitSelect onChangeLimit={pagination.onChangeLimit} />
        </div>
        <button className="btn-primary btn" onClick={onAddExpense}>
          <AiOutlinePlus className="block text-white sm:hidden" size={24} />
          {t('expenses.add')}
        </button>
      </div>
      <div className={cxWithGrowFadeLg('hidden md:block pb-8', showFilters)}>
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
          />
          <PaginationButtons total={total} {...pagination} />
        </>
      )}
    </div>
  )
}
