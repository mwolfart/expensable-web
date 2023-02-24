import { LoaderArgs } from '@remix-run/server-runtime'
import { useTranslations } from 'use-intl'
import { AiOutlinePlus } from 'react-icons/ai'
import { BiFilterAlt } from 'react-icons/bi'
import { getUserExpenses } from '~/models/expenses.server'
import { getUserId } from '~/session.server'
import { NoData } from '~/components/no-data'
import { ExpenseList } from '~/components/expense-list'
import { typedjson } from 'remix-typedjson'
import { useTypedLoaderData } from 'remix-typedjson/dist/remix'
import { useContext } from 'react'
import { DialogContext } from '~/providers/dialog'
import { AddExpenseDialog } from '~/components/expense-add-dialog'

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

export default function Expenses() {
  const { expenses } = useTypedLoaderData<typeof loader>()
  const t = useTranslations()
  const { openDialog } = useContext(DialogContext)

  const onAddExpense = () => {
    console.log('add Expense')
    openDialog(<AddExpenseDialog />)
  }

  return (
    <div className="m-8 mt-0 flex flex-grow flex-col gap-2 md:mt-4 md:gap-4">
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
      <ExpenseList expenses={expenses} renderDeleteToast={() => {}} />
    </div>
  )
}
