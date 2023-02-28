import { useTranslations } from 'use-intl'
import { formatCurrency } from '~/utils'
import { ExpenseWithCategory } from '~/utils/types'
import { BsTrash } from 'react-icons/bs'
import { MdOutlineEdit } from 'react-icons/md'
import { useFetcher } from '@remix-run/react'
import { useEffect } from 'react'

type Props = {
  expense: ExpenseWithCategory
  renderDeleteToast: () => void
  renderEditDialog: (expense: ExpenseWithCategory) => void
  categoryMap: Map<string, string>
}

export function ExpenseItem({
  expense,
  renderDeleteToast,
  renderEditDialog,
  categoryMap,
}: Props) {
  const t = useTranslations()
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.data?.method === 'delete' && fetcher.data.success) {
      renderDeleteToast()
    }
  }, [fetcher.data])

  const onDelete = () => {
    fetcher.submit(null, { method: 'delete', action: '/expenses' })
  }

  const onEdit = () => {
    renderEditDialog(expense)
  }

  return (
    <div className="grid items-center gap-2 bg-foreground py-4 sm:grid-cols-2">
      <p className="text-md font-semibold">{expense.title}</p>
      <p className="sm:text-right">{expense.datetime.toLocaleDateString()}</p>
      <div>
        <p>{formatCurrency(expense.amount)}</p>
        {expense.unit && (
          <small>
            {t('common.each', { value: formatCurrency(expense.unit) })}
          </small>
        )}
      </div>
      <div className="flex flex-row flex-wrap gap-2 sm:justify-end">
        {expense.categories.map(({ categoryId }) => (
          <span
            key={expense.id + categoryId}
            className="inline rounded bg-light-grey p-1 text-xs font-semibold uppercase"
          >
            {categoryMap.get(categoryId)}
          </span>
        ))}
      </div>
      <div className="flex justify-end gap-4 sm:col-span-2">
        <button className="btn-outline btn-primary min-h-8 btn hidden h-10 w-24 sm:block">
          {t('common.edit')}
        </button>
        <button className="btn-outline btn-primary min-h-8 btn hidden h-10 w-24 sm:block">
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
