import type { ExpenseWithCategory } from '~/utils/types'
import type { SerializeFrom } from '@remix-run/server-runtime'
import { ExpenseItem } from './expense-item'

type Props = {
  expenses: SerializeFrom<ExpenseWithCategory>[]
  renderDeleteToast: () => void
  renderEditDialog: (expense: SerializeFrom<ExpenseWithCategory>) => void
}

export function ExpenseList({
  expenses,
  renderDeleteToast,
  renderEditDialog,
}: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          renderDeleteToast={renderDeleteToast}
          renderEditDialog={renderEditDialog}
        />
      ))}
    </div>
  )
}
