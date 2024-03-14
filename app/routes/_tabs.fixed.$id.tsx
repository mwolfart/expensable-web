import type { LoaderFunctionArgs } from '@remix-run/server-runtime'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import { getUserFixedExpenseById } from '~/infra/models/fixed-expense.server'
import { getLoggedUserId } from '~/infra/session.server'
import { UpsertFixedExpenseForm } from '~/presentation/components/fixed-expense-upsert-form'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await getLoggedUserId(request)
  const expenseId = params.id
  if (userId && expenseId) {
    const expense = await getUserFixedExpenseById(userId, expenseId)
    if (expense) {
      const { childExpenses, category, ...mainExpense } = expense
      return json({ expense: mainExpense, childExpenses })
    }
  }
  return json({ expense: null, childExpenses: null })
}

export default function FixedExpenseId() {
  const navigate = useNavigate()
  const { expense, childExpenses } = useLoaderData<typeof loader>()

  const onGoBack = () => {
    navigate('/fixed-expenses')
  }

  return (
    <div className="px-8">
      <UpsertFixedExpenseForm
        onGoBack={onGoBack}
        initialData={expense}
        monthExpenses={childExpenses}
      />
    </div>
  )
}
