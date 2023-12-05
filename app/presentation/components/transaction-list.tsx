import type { SerializeFrom } from '@remix-run/server-runtime'
import type { TransactionWithExpenses } from '~/utils/types'
import { TransactionItem } from './transaction-item'

type Props = {
  transactions: SerializeFrom<TransactionWithExpenses[]>
  renderDeleteToast: () => void
  renderEditDialog: (
    transaction: SerializeFrom<TransactionWithExpenses>,
  ) => void
}

export function TransactionList({
  transactions,
  renderDeleteToast,
  renderEditDialog,
}: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          renderDeleteToast={renderDeleteToast}
          renderEditDialog={renderEditDialog}
        />
      ))}
    </div>
  )
}
