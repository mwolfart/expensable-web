import type { ExpenseWithCategory } from '~/utils/types'
import { ExpenseItem } from './expense-item'

type Props = {
  expenses: ExpenseWithCategory[]
  categoryMap: Map<string, string>
  renderDeleteToast: () => void
  renderEditDialog: (expense: ExpenseWithCategory) => void
}

export function ExpenseList({
  expenses,
  renderDeleteToast,
  renderEditDialog,
  categoryMap,
}: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          renderDeleteToast={renderDeleteToast}
          renderEditDialog={renderEditDialog}
          categoryMap={categoryMap}
        />
      ))}
    </div>
  )
}
