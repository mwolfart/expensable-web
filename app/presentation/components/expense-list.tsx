import type { ExpenseWithCategory } from '~/utils/types'
import type { SerializeFrom } from '@remix-run/server-runtime'
import { ExpenseItem } from './expense-item'

type Props = {
  expenses: SerializeFrom<ExpenseWithCategory>[]
}

export function ExpenseList({ expenses }: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </div>
  )
}
