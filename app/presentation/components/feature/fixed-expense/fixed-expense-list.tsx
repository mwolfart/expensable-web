import type { FixedExpenseWithDetails } from '~/utils/types'
import type { SerializeFrom } from '@remix-run/server-runtime'
import { FixedExpenseItem } from './fixed-expense-item'

type Props = {
  expenses: SerializeFrom<FixedExpenseWithDetails[]>
}

export function FixedExpenseList({ expenses }: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {expenses.map((expense) => (
        <FixedExpenseItem key={expense.id} expense={expense} />
      ))}
    </div>
  )
}
