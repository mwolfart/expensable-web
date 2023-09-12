import type { ExpenseWithCategory } from '~/utils/types'
import { useContext } from 'react'
import { BsTrash } from 'react-icons/bs'
import { formatCurrency } from '~/utils'
import { CategoryContext } from '~/providers/category'
import { useTranslations } from 'use-intl'

type Props = {
  index: number
  onRemove: (index: number) => unknown
  canRemove: boolean
  expense: ExpenseWithCategory
}

export function TransactionExpenseRow({
  index,
  onRemove,
  canRemove,
  expense,
}: Props) {
  const { map: categoryMap } = useContext(CategoryContext)
  const t = useTranslations()

  return (
    <>
      <div className="max-lg:font-bold">{expense.title}</div>
      <div className="max-lg:text-xs max-lg:text-grey">
        {expense.unit ? formatCurrency(expense.unit) : ''}
      </div>
      <div>{formatCurrency(expense.amount)}</div>
      <div className="max-lg:col-start-2 max-lg:font-bold max-lg:text-grey">
        {categoryMap.get(expense.categories[0].categoryId)}
      </div>
      <div className="max-lg:col-start-2 max-lg:row-start-3">{`${expense.installments}x`}</div>
      <div className="max-lg:row-start-4 lg:flex lg:justify-end">
        <button
          className="hidden lg:block btn-outline btn-primary btn"
          onClick={() => onRemove(index)}
          disabled={canRemove}
          aria-label={t('common.remove')}
        >
          <BsTrash size={20} />
        </button>
        <button
          className="block lg:hidden btn-outline btn-primary btn p-2 min-h-0 h-auto"
          onClick={() => onRemove(index)}
          disabled={canRemove}
        >
          {t('common.remove')}
        </button>
      </div>
    </>
  )
}
