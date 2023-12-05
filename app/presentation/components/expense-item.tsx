import type { SerializeFrom } from '@remix-run/server-runtime'
import type { ExpenseWithCategory, FetcherResponse } from '~/utils/types'
import { useTranslations } from 'use-intl'
import { formatCurrency, formatDate } from '~/utils/helpers'
import { BsTrash } from 'react-icons/bs'
import { MdOutlineEdit } from 'react-icons/md'
import { useFetcher } from '@remix-run/react'
import { useContext, useEffect } from 'react'
import { CategoryContext } from '~/presentation/providers/category'

type Props = {
  expense: SerializeFrom<ExpenseWithCategory>
  renderDeleteToast: () => void
  renderEditDialog: (expense: SerializeFrom<ExpenseWithCategory>) => void
}

export function ExpenseItem({
  expense,
  renderDeleteToast,
  renderEditDialog,
}: Props) {
  const t = useTranslations()
  const fetcher = useFetcher<FetcherResponse>()
  const { map: categoryMap } = useContext(CategoryContext)

  useEffect(() => {
    if (fetcher.data?.method === 'delete' && fetcher.data.success) {
      renderDeleteToast()
    }
  }, [fetcher.data, renderDeleteToast])

  const onDelete = () => {
    fetcher.submit(
      { id: expense.id },
      { method: 'delete', action: '/expenses' },
    )
  }

  const onEdit = () => {
    renderEditDialog(expense)
  }

  const date = formatDate(new Date(expense.datetime))

  return (
    <div className="grid items-center gap-2 bg-foreground py-4 sm:grid-cols-2">
      <p className="text-md font-semibold">{expense.title}</p>
      <p className="sm:text-right">{date}</p>
      <div className="flex flex-col">
        <p>{formatCurrency(expense.amount)}</p>
        {expense.unit && (
          <small>
            {t('common.each', { value: formatCurrency(expense.unit) })}
          </small>
        )}
        {expense.installments > 1 && (
          <small>{`${expense.installments}x`}</small>
        )}
      </div>
      <div className="flex flex-row flex-wrap gap-2 sm:justify-end">
        {expense.categories.map(({ categoryId }) => {
          const catLabel = categoryMap.get(categoryId)
          return (
            catLabel && (
              <span
                key={expense.id + categoryId}
                className="inline rounded bg-light-grey p-1 text-xs font-semibold uppercase"
              >
                {catLabel}
              </span>
            )
          )
        })}
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
