import { ExpenseWithCategory } from '~/utils/types'
import { ExpenseItem } from './expense-item'

type Props = {
  expenses: Array<ExpenseWithCategory>
  renderDeleteToast: () => void
}

export function ExpenseList({ expenses, renderDeleteToast }: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          renderDeleteToast={renderDeleteToast}
        />
      ))}
    </div>
  )
}
