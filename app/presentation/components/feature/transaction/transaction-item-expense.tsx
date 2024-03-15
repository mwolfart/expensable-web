import { formatCurrency, trimStr } from '~/utils/helpers'

type Props = {
  title: string
  amount: number
}

export function TransactionItemExpense({ title, amount }: Props) {
  return (
    <div className="flex w-24 flex-col gap-1 rounded-xl border border-black p-2 text-xs">
      <p>{trimStr(title)}</p>
      <span className="font-semibold text-grey">{formatCurrency(amount)}</span>
    </div>
  )
}
