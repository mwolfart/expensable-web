import type {
  AddTransactionFormErrors,
  TransactionWithExpenses,
} from '~/utils/types'
import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from '@remix-run/server-runtime'
import { useNavigate, useSearchParams } from '@remix-run/react'
import { useState } from 'react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { useTranslations } from 'use-intl'
import { NoData } from '~/presentation/components/no-data'
import { PaginationButtons } from '~/presentation/components/pagination-buttons'
import { Toast } from '~/presentation/components/toast'
import { TransactionList } from '~/presentation/components/transaction-list'
import { useFilter } from '~/presentation/hooks/use-filter'
import { usePagination } from '~/presentation/hooks/use-pagination'
import {
  countUserTransactions,
  countUserTransactionsByFilter,
  createTransaction,
  deleteTransaction,
  getUserTransactions,
  getUserTransactionsByFilter,
  updateTransaction,
} from '~/infra/models/transaction.server'
import { getLoggedUserId } from '~/infra/session.server'
import {
  areAllValuesEmpty,
  cxWithGrowFadeLg,
  parseExpenses,
  timeout,
} from '~/utils/helpers'
import { AiOutlinePlus } from 'react-icons/ai'
import { PaginationLimitSelect } from '~/presentation/components/pagination-limit-select'
import { FilterButton } from '~/presentation/components/filter-button'
import { MobileCancelDialog } from '~/presentation/components/mobile-cancel-dialog'
import { TransactionFilterComponent } from '~/presentation/components/transaction-filters'
import { ErrorCodes } from '~/utils/schemas'

export async function loader({ request }: LoaderArgs) {
  const userId = await getLoggedUserId(request)
  if (userId) {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') as string)
    const offset = parseInt(url.searchParams.get('offset') as string)
    const filter = {
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
    }
    if (!areAllValuesEmpty(filter)) {
      const parsedFilter = {
        startDate: filter.startDate ? new Date(filter.startDate) : null,
        endDate: filter.endDate ? new Date(filter.endDate) : null,
      }
      const count = await countUserTransactionsByFilter(userId, parsedFilter)
      const data = await getUserTransactionsByFilter(
        userId,
        parsedFilter,
        offset,
        limit,
      )
      if (data) {
        return typedjson({ transactions: data, total: count })
      }
    } else {
      const count = await countUserTransactions(userId)
      const data = await getUserTransactions(userId, offset, limit)
      if (data) {
        return typedjson({ transactions: data, total: count })
      }
    }
  }
  return typedjson({ transactions: [], total: 0 })
}

export async function action({ request }: ActionArgs): Promise<
  TypedResponse<{
    errors?: AddTransactionFormErrors
    success?: boolean
    method?: string
  }>
> {
  const { method } = request
  const res = { method }
  if (method === 'PUT') {
    const formData = await request.formData()
    const id = formData.get('id')
    const title = formData.get('title')
    const date = formData.get('date')
    const expensesJson = formData.get('expenses')

    if (typeof title !== 'string' || !title.length) {
      return typedjson(
        { errors: { title: ErrorCodes.TITLE_REQUIRED }, ...res },
        { status: 400 },
      )
    }

    if (typeof date !== 'string' || isNaN(Date.parse(date))) {
      return typedjson(
        { errors: { date: ErrorCodes.BAD_DATE_FORMAT }, ...res },
        { status: 400 },
      )
    }

    const expenses =
      typeof expensesJson === 'string' && parseExpenses(expensesJson)
    if (!expenses) {
      return typedjson(
        { errors: { expenses: ErrorCodes.BAD_FORMAT }, ...res },
        { status: 400 },
      )
    }

    try {
      const userId = await getLoggedUserId(request)
      if (!userId) {
        return typedjson({ success: false, ...res }, { status: 403 })
      }

      const transaction = {
        datetime: new Date(Date.parse(date)),
        location: title,
        userId,
      }

      if (typeof id === 'string' && id !== '') {
        await updateTransaction({ id, ...transaction }, expenses)
      } else {
        await createTransaction(transaction, expenses)
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
      await deleteTransaction(id)
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

export default function Transactions() {
  const { transactions, total } = useTypedLoaderData<typeof loader>()
  const t = useTranslations()
  const navigate = useNavigate()

  const [params] = useSearchParams()
  const [startDate, endDate] = [params.get('startDate'), params.get('endDate')]
  const appliedFilters = {
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  }

  const [showFilters, setShowFilters] = useState(false)
  const [showDeletedToast, setShowDeletedToast] = useState(false)

  const pagination = usePagination({ url: '/transactions', total })
  const filter = useFilter({ url: '/transactions' })

  const onAddTransaction = () => {
    navigate('/transaction/new')
  }

  const onTransactionDeleted = async () => {
    setShowDeletedToast(true)
    await timeout(3000)
    setShowDeletedToast(false)
  }

  const onEditTransaction = (transaction: TransactionWithExpenses) => {
    navigate(`/transaction/${transaction.id}`)
  }

  const FiltersBlock = (
    <TransactionFilterComponent
      onApplyFilters={filter.onApplyFilters}
      onClearFilters={filter.onClearFilters}
      initialFilters={appliedFilters}
    />
  )

  return (
    <div className="m-4 mt-0 md:mt-4 md:m-8">
      {showDeletedToast && (
        <Toast message={t('transactions.deleted')} severity="alert-info" />
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
        <button className="btn-primary btn" onClick={onAddTransaction}>
          <AiOutlinePlus className="block text-white sm:hidden" size={24} />
          {t('transactions.add')}
        </button>
      </div>
      <div className={cxWithGrowFadeLg('hidden md:block pb-8', showFilters)}>
        {FiltersBlock}
      </div>
      {!transactions.length && (
        <NoData>
          <p>{t('transactions.try-adding')}</p>
        </NoData>
      )}
      {!!transactions.length && (
        <>
          <TransactionList
            transactions={transactions}
            renderDeleteToast={onTransactionDeleted}
            renderEditDialog={onEditTransaction}
          />
          <PaginationButtons total={total} {...pagination} />
        </>
      )}
    </div>
  )
}
