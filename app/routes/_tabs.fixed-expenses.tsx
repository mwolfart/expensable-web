import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
} from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import type { AddExpenseFormErrors } from '~/utils/types'
import { useTranslations } from 'use-intl'
import { AiOutlinePlus } from 'react-icons/ai'
import { getLoggedUserId } from '~/infra/session.server'
import { NoData } from '~/presentation/components/layout/no-data'
import { fixedExpenseSchema } from '~/utils/schemas/server'
import { ErrorCodes } from '~/utils/enum'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { usePagination } from '~/presentation/hooks/use-pagination'
import { PaginationButtons } from '~/presentation/components/ui/pagination-buttons'
import { PaginationLimitSelect } from '~/presentation/components/ui/pagination-limit-select'
import type { ValidationError } from 'yup'
import {
  countUserFixedExpenses,
  createFixedExpense,
  deleteFixedExpense,
  getUserFixedExpenses,
  updateFixedExpense,
} from '~/infra/models/fixed-expense.server'
import { FixedExpenseList } from '~/presentation/components/feature/fixed-expense/fixed-expense-list'
import { DataListContainer } from '~/presentation/components/layout/data-list-container'
import { handleError } from '~/entry.server'
import { validateServerSchema } from '~/utils/helpers'

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getLoggedUserId(request)
  if (userId) {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') as string)
    const offset = parseInt(url.searchParams.get('offset') as string)

    const count = await countUserFixedExpenses(userId)
    const data = await getUserFixedExpenses(userId, offset, limit)
    if (data) {
      return json({ expenses: data, total: count })
    }
  }
  return json({ expenses: [], total: 0 })
}

export async function action({ request }: ActionFunctionArgs): Promise<
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
    const dataObj = Object.fromEntries(formData.entries())
    const validationErrors = validateServerSchema(fixedExpenseSchema, dataObj)
    if (validationErrors !== null) {
      return json({ ...validationErrors, ...res }, { status: 400 })
    }

    const id = formData.get('id')
    const title = formData.get('title') as string
    const startDate = new Date(Date.parse(formData.get('startDate') as string))
    const varyingCosts = formData.get('varyingCosts') === '1'
    const amount = parseFloat(formData.get('amount') as string)
    const amountPerMonth = JSON.parse(formData.get('amountPerMonth') as string)
    const amountOfMonths = parseInt(formData.get('amountOfMonths') as string)
    const categoryId = (formData.get('categoryId') as string) || null

    try {
      const userId = await getLoggedUserId(request)
      if (!userId) {
        return json({ success: false, ...res }, { status: 403 })
      }

      if (typeof id === 'string' && id !== '') {
        await updateFixedExpense({
          id,
          title,
          date: startDate,
          varyingCosts,
          amount,
          amountPerMonth,
          amountOfMonths,
          categoryId,
          userId,
        })
      } else {
        await createFixedExpense({
          title,
          date: startDate,
          varyingCosts,
          amount,
          amountPerMonth,
          amountOfMonths,
          categoryId,
          userId,
        })
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
      await deleteFixedExpense(id)
    } catch (e) {
      handleError(e)
      return json({ success: false, ...res }, { status: 500 })
    }
    return json({ success: true, ...res }, { status: 200 })
  }
  return json({ success: false, ...res }, { status: 405 })
}

export default function FixedExpenses() {
  const { expenses, total } = useLoaderData<typeof loader>()
  const t = useTranslations()
  const navigate = useNavigate()
  const pagination = usePagination({ url: '/fixed-expenses', total })

  const onAddExpense = () => {
    navigate('/fixed/new')
  }

  return (
    <DataListContainer>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-0 sm:items-end">
        <div className="flex items-end gap-4">
          <PaginationLimitSelect onChangeLimit={pagination.onChangeLimit} />
        </div>
        <button className="btn-primary btn" onClick={onAddExpense}>
          <AiOutlinePlus className="block text-white sm:hidden" size={24} />
          {t('expenses.add')}
        </button>
      </div>
      {!expenses.length && (
        <NoData>
          <p>{t('expenses.try-adding')}</p>
        </NoData>
      )}
      {!!expenses.length && (
        <>
          <FixedExpenseList expenses={expenses} />
          <PaginationButtons total={total} {...pagination} />
        </>
      )}
    </DataListContainer>
  )
}
