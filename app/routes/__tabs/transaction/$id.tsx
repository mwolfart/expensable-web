import type { LoaderArgs } from '@remix-run/server-runtime'
import { useFetcher, useNavigate, useNavigation } from '@remix-run/react'
import { BeatLoader } from 'react-spinners'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { UpsertTransactionForm } from '~/components/transaction-upsert-form'
import { getUserTransactionById } from '~/models/transaction.server'
import { getLoggedUserId } from '~/session.server'
import { useEffect, useState } from 'react'

export async function loader({ request, params }: LoaderArgs) {
  const userId = await getLoggedUserId(request)
  const transactionId = params.id
  if (userId && transactionId) {
    const transaction = await getUserTransactionById(transactionId)
    if (transaction) {
      return typedjson({ transaction })
    }
  }
  return typedjson({ transaction: null })
}

export default function TransactionId() {
  const navigate = useNavigate()
  const { transaction } = useTypedLoaderData<typeof loader>()
  const { state } = useNavigation()
  const expensesFetcher = useFetcher()
  const [isLoadingExpenses, setLoadingExpenses] = useState(true)
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    if (expensesFetcher.data) {
      setExpenses(expensesFetcher.data.expenses)
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
