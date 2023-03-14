import type { FormEventHandler } from 'react'
import type {
  ExpenseWithCategory,
  TransactionWithExpenses,
} from '~/utils/types'
import { useState } from 'react'
import { Form, useFetcher } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { useContext, useEffect } from 'react'
import { DialogContext } from '~/providers/dialog'

type Props = {
  onUpserted: (updated?: boolean) => unknown
  initialData?: TransactionWithExpenses
}

export function UpsertTransactionDialog({ onUpserted, initialData }: Props) {
  const t = useTranslations()
  const fetcher = useFetcher()
  const { closeDialog } = useContext(DialogContext)

  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])

  useEffect(() => {
    if (fetcher.data?.errors) {
      //   updateFormErrors(fetcher.data.errors)
    } else if (fetcher.data?.success) {
      onUpserted()
      closeDialog()
    }
  }, [closeDialog, fetcher.data, onUpserted])

  const onSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const data = new FormData(evt.currentTarget)
    if (initialData) {
      data.set('id', initialData.id)
    }
    fetcher.submit(data, { method: 'put', action: '/transactions' })
  }

  return (
    <Form className="grid gap-4 p-8 lg:grid-cols-2" onSubmit={onSubmit}>
      <label>
        {t('common.title')}
        <input className="input" name="title" />
      </label>
      <label>
        {t('common.date')}
        <input className="input" name="date" />
      </label>
      <div>
        <h3 className="lg:col-span-2">{t('common.expenses')}</h3>
        <div className="flex flex-col gap-2"></div>
      </div>
    </Form>
  )
}
