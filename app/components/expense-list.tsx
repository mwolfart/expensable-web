import { Category } from '@prisma/client'
import { ExpenseWithCategory } from '~/utils/types'
import { ExpenseItem } from './expense-item'

type Props = {
  expenses: ExpenseWithCategory[]
  categories: Category[]
  renderDeleteToast: () => void
  renderEditDialog: (expense: ExpenseWithCategory) => void
}

export function ExpenseList({
  expenses,
  renderDeleteToast,
  renderEditDialog,
  categories,
}: Props) {
  const categoryMap = new Map<string, string>()
  categories.forEach(({ id, title }) => {
    categoryMap.set(id, title)
  })

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
