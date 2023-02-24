import { ExpenseWithCategory } from '~/utils/types'

type Props = {
  expense: ExpenseWithCategory
  renderDeleteToast: () => void
}

export function ExpenseItem({ expense, renderDeleteToast }: Props) {
  return (
    <div className="grid grid-cols-2-grow-left grid-rows-2 gap-2">
      <p>{expense.title}</p>
      <p>{expense.datetime.toLocaleDateString()}</p>
      <div>
        <p>{expense.amount}</p>
        {expense.unit && <small>{expense.unit}</small>}
      </div>
      <div>Categories</div>
    </div>
  )
}
