import type {
  ExpenseWithCategory,
  TransactionWithExpenses,
} from '~/utils/types'
import { useTranslations } from 'use-intl'
import { formatCurrency, formatDate } from '~/utils'
import { BsTrash } from 'react-icons/bs'
import { MdOutlineEdit } from 'react-icons/md'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { TransactionItemExpense } from './transaction-item-expense'

type Props = {
  transaction: TransactionWithExpenses
  renderDeleteToast: () => void
  renderEditDialog: (transaction: TransactionWithExpenses) => void
}

export function TransactionItem({
  transaction,
  renderDeleteToast,
  renderEditDialog,
}: Props) {
  const t = useTranslations()
  const fetcher = useFetcher()
  const expensesFetcher = useFetcher()
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [expenseTotal, setExpenseTotal] = useState(0)

  useEffect(() => {
    if (fetcher.data?.method === 'delete' && fetcher.data.success) {
      renderDeleteToast()
    }
  }, [fetcher.data, renderDeleteToast])

  useEffect(() => {
    if (expensesFetcher.data) {
      setExpenses(expensesFetcher.data.expenses)
      setExpenseTotal(expensesFetcher.data.total)
    }
  }, [expensesFetcher.data])

  useEffect(() => {
    const expensesToFetch = transaction.expenses
      .map(({ expenseId }) => expenseId)
      .join(',')
    expensesFetcher.load(`/expenses?ids=${expensesToFetch}&limit=5`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction.expenses])

  const onDelete = () => {
    fetcher.submit(
      { id: transaction.id },
      { method: 'delete', action: '/transaction' },
    )
  }

  const onEdit = () => {
    renderEditDialog(transaction)
  }

  const date = formatDate(transaction.datetime)

  return (
    <div className="grid items-center gap-2 bg-foreground py-4 sm:grid-cols-2">
      <p className="text-md font-semibold">{transaction.location}</p>
      <p className="sm:text-right">{date}</p>
      <div>
        <p>{formatCurrency(transaction.total)}</p>
      </div>
      <div className="my-2 flex flex-row flex-nowrap gap-2 sm:justify-end">
        {expensesFetcher.state === 'loading' ? (
          <BeatLoader color="grey" size={10} />
        ) : (
          <>
            {expenses.map(({ id, title, amount }) => (
              <TransactionItemExpense key={id} title={title} amount={amount} />
            ))}
            {expenseTotal > 5 && (
              <div className="flex flex-col gap-1">
                <span>+</span>
                <p>{t('common.n-more', { value: expenseTotal - 5 })}</p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex justify-end gap-4 sm:col-span-2">
        <button
          className="btn-outline btn-primary min-h-8 btn hidden h-10 w-24 sm:block"
          onClick={onEdit}
        >
          {t('common.edit')}
        </button>
        <button
          className="btn-outline btn-primary min-h-8 btn hidden h-10 w-24 sm:block"
          onClick={onDelete}
        >
          {t('common.delete')}
        </button>
        <button
          className="btn-outline btn-primary min-h-8 btn block h-10 sm:hidden"
          aria-label={t('common.edit')}
          onClick={onEdit}
        >
          <MdOutlineEdit size={20} />
        </button>
        <button
          className="btn-outline btn-primary min-h-8 btn block h-10 sm:hidden"
          aria-label={t('common.delete')}
          onClick={onDelete}
        >
          <BsTrash size={20} />
        </button>
      </div>
    </div>
  )
}
