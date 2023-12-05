import { json, type LoaderFunctionArgs } from '@remix-run/server-runtime'
import type { ExpenseWithCategory, FetcherResponse } from '~/utils/types'
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import { BeatLoader } from 'react-spinners'
import { UpsertTransactionForm } from '~/presentation/components/transaction-upsert-form'
import { getUserTransactionById } from '~/infra/models/transaction.server'
import { getLoggedUserId } from '~/infra/session.server'
import { useEffect, useState } from 'react'

type ExpensesFetcher = FetcherResponse & {
  expenses: unknown
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await getLoggedUserId(request)
  const transactionId = params.id
  if (userId && transactionId) {
    const transaction = await getUserTransactionById(transactionId)
    if (transaction) {
      return json({ transaction })
    }
  }
  return json({ transaction: null })
}

export default function TransactionId() {
  const navigate = useNavigate()
  const { transaction } = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const expensesFetcher = useFetcher<ExpensesFetcher>()
  const [isLoadingExpenses, setLoadingExpenses] = useState(true)
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])

  useEffect(() => {
    if (expensesFetcher.data) {
      setExpenses(expensesFetcher.data.expenses as ExpenseWithCategory[])
      setLoadingExpenses(false)
    }
  }, [expensesFetcher.data])

  useEffect(() => {
    if (transaction) {
      const expensesToFetch = transaction.expenses
        .map(({ expenseId }) => expenseId)
        .join(',')
      expensesFetcher.load(`/expenses?ids=${expensesToFetch}&limit=30`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction])

  const onGoBack = () => {
    navigate('/transactions')
  }

  const isLoading = state === 'loading'

  if (transaction && !isLoading) {
    return (
      <div className="h-full px-8 pb-8">
        <UpsertTransactionForm
          onGoBack={onGoBack}
          initialData={transaction}
          initialExpenses={expenses}
          isLoadingExpenses={isLoadingExpenses}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full px-8 pb-8">
        <BeatLoader color="grey" size={10} />
      </div>
    )
  }

  navigate('/transactions')
  return <></>
}
