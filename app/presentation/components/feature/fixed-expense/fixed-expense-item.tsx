import type { FetcherResponse, FixedExpenseWithDetails } from '~/utils/types'
import type { SerializeFrom } from '@remix-run/server-runtime'
import { useTranslation } from 'react-i18next'
import { formatCurrency, formatDate, truncStr } from '~/utils/helpers'
import { BsTrash } from 'react-icons/bs'
import { MdOutlineEdit } from 'react-icons/md'
import { useFetcher, useNavigate } from '@remix-run/react'
import { useContext, useEffect } from 'react'
import { ToastContext, ToastType } from '../../../providers/toast'
import { DialogContext } from '~/presentation/providers/dialog'
import { DeletionPrompt } from '../common/deletion-prompt'

type Props = {
  expense: SerializeFrom<FixedExpenseWithDetails>
}

export function FixedExpenseItem({ expense }: Props) {
  const { t } = useTranslation()
  const fetcher = useFetcher<FetcherResponse>()
  const navigate = useNavigate()

  const { showToast } = useContext(ToastContext)
  const { openDialog, closeDialog } = useContext(DialogContext)

  useEffect(() => {
    if (fetcher.data?.method === 'delete' && fetcher.data.success) {
      showToast(ToastType.SUCCESS, t('expenses.deleted'))
    }
  }, [fetcher.data])

  const upcomingExpenses = expense.childExpenses.slice(0, 6)

  const onDelete = () => {
    fetcher.submit(
      { id: expense.id },
      { method: 'delete', action: '/fixed-expenses' },
    )
    closeDialog()
  }

  const onDeletePrompt = () => {
    openDialog(<DeletionPrompt onConfirm={onDelete} onCancel={closeDialog} />)
  }

  const onEdit = () => {
    navigate(`/fixed/${expense.id}`)
  }

  const totalItems = expense.amountOfMonths

  return (
    <div className="flex items-center gap-4 bg-foreground py-4">
      <div className="flex flex-col gap-1 flex-grow">
        <p className="text-md font-semibold hidden md:block">
          {expense.title?.toString()}
        </p>
        <p className="text-md font-semibold block md:hidden">
          {truncStr(expense.title, 10)}
        </p>
        <small className="pb-2">
          {t('expenses.total-items', { value: totalItems })}
        </small>
        {expense.category && (
          <span className="inline rounded bg-light-grey p-1 text-xs font-semibold uppercase w-fit">
            {expense.category.title}
          </span>
        )}
      </div>
      <div className="flex-row flex-grow gap-2 sm:justify-end hidden lg:flex">
        {upcomingExpenses.map(({ id, amount, date }) => (
          <div
            key={id}
            className="hidden xl:flex [&:nth-child(-n+3)]:lg:flex inline rounded border-black border p-1 text-xs text-grey font-semibold uppercase flex-col gap-1"
          >
            <span>{formatCurrency(amount)}</span>
            <span>{formatDate(new Date(date)).substring(3)}</span>
          </div>
        ))}
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
          onClick={onDeletePrompt}
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
          onClick={onDeletePrompt}
        >
          <BsTrash size={20} />
        </button>
      </div>
    </div>
  )
}
