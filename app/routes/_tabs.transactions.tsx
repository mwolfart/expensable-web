import type { AddTransactionFormErrors } from '~/utils/types'
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  TypedResponse,
} from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react'
import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { NoData } from '~/presentation/components/layout/no-data'
import { PaginationButtons } from '~/presentation/components/ui/pagination-buttons'
import { TransactionList } from '~/presentation/components/feature/transaction/transaction-list'
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
  validateServerSchema,
} from '~/utils/helpers'
import { AiOutlinePlus } from 'react-icons/ai'
import { PaginationLimitSelect } from '~/presentation/components/ui/pagination-limit-select'
import { FilterButton } from '~/presentation/components/ui/filter-button'
import { MobileCancelDialog } from '~/presentation/components/layout/mobile-cancel-dialog'
import { TransactionFilterComponent } from '~/presentation/components/feature/transaction/transaction-filters'
import { ErrorCodes } from '~/utils/enum'
import { DataListContainer } from '~/presentation/components/layout/data-list-container'
import { handleError } from '~/entry.server'
import { transactionSchema } from '~/utils/schemas/server'

export async function loader({ request }: LoaderFunctionArgs) {
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
        return json({ transactions: data, total: count })
      }
    } else {
      const count = await countUserTransactions(userId)
      const data = await getUserTransactions(userId, offset, limit)
      if (data) {
        return json({ transactions: data, total: count })
      }
    }
  }
  return json({ transactions: [], total: 0 })
}

export async function action({ request }: ActionFunctionArgs): Promise<
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
    const dataObj = Object.fromEntries(formData.entries())
    const validationErrors = validateServerSchema(transactionSchema, dataObj)
    if (validationErrors !== null) {
      return json({ ...validationErrors, ...res }, { status: 400 })
    }

    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const expensesJson = formData.get('expenses') as string

    const expenses = parseExpenses(expensesJson)
    if (!expenses) {
      return json(
        { errors: { expenses: ErrorCodes.BAD_FORMAT }, ...res },
        { status: 400 },
      )
    }

    try {
      const userId = await getLoggedUserId(request)
      if (!userId) {
        return json({ success: false, ...res }, { status: 403 })
      }

      const transaction = {
        datetime: new Date(Date.parse(date)),
        location: title,
        userId,
      }

      if (id !== '') {
        await updateTransaction({ id, ...transaction }, expenses)
      } else {
        await createTransaction(transaction, expenses)
      }
    } catch (e) {
      handleError(e)
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
      await deleteTransaction(id)
    } catch (e) {
      handleError(e)
      return json({ success: false, ...res }, { status: 500 })
    }
    return json({ success: true, ...res }, { status: 200 })
  }
  return json({ success: false, ...res }, { status: 405 })
}

export default function Transactions() {
  const { transactions, total } = useLoaderData<typeof loader>()
  const t = useTranslations()
  const navigate = useNavigate()

  const [params] = useSearchParams()
  const [startDate, endDate] = [params.get('startDate'), params.get('endDate')]
  const appliedFilters = {
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  }

  const [showFilters, setShowFilters] = useState(false)

  const pagination = usePagination({ url: '/transactions', total })
  const filter = useFilter({ url: '/transactions' })

  const onAddTransaction = () => {
    navigate('/transaction/new')
  }

  const FiltersBlock = (
    <TransactionFilterComponent
      onApplyFilters={filter.onApplyFilters}
      onClearFilters={filter.onClearFilters}
      initialFilters={appliedFilters}
    />
  )

  return (
    <DataListContainer>
      {showFilters && (
        <MobileCancelDialog
          content={FiltersBlock}
          onClose={() => setShowFilters(false)}
        />
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-0 sm:items-end">
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
      <div className={cxWithGrowFadeLg('hidden md:block', showFilters)}>
        {FiltersBlock}
      </div>
      {!transactions.length && (
        <NoData>
          <p>{t('transactions.try-adding')}</p>
        </NoData>
      )}
      {!!transactions.length && (
        <>
          <TransactionList transactions={transactions} />
          <PaginationButtons total={total} {...pagination} />
        </>
      )}
    </DataListContainer>
  )
}
