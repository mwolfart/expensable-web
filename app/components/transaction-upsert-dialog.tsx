import type { FormEventHandler } from 'react'
import type {
  AddTransactionFormErrors,
  TransactionExpenseInput,
  TransactionWithExpenses,
} from '~/utils/types'
import { useState, useReducer, useContext, useEffect } from 'react'
import { Form, useFetcher } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { DialogContext } from '~/providers/dialog'
import { TransactionExpenseInputGroup } from './transaction-expense-input-group'
import { cxFormInput, cxWithGrowFadeMd } from '~/utils'

type Props = {
  onUpserted: (updated?: boolean) => unknown
  initialData?: TransactionWithExpenses
}

const errorsReducer = (
  state: AddTransactionFormErrors,
  action: AddTransactionFormErrors,
) => ({
  ...state,
  ...action,
})

export function UpsertTransactionDialog({ onUpserted, initialData }: Props) {
  const t = useTranslations()
  const fetcher = useFetcher()
  const { closeDialog } = useContext(DialogContext)

  const initialErrors = {
    title: '',
    date: '',
    expenses: '',
  }
  const [formErrors, updateFormErrors] = useReducer(
    errorsReducer,
    initialErrors,
  )
  const [expenses, setExpenses] = useState<Partial<TransactionExpenseInput>[]>([
    {},
  ])

  useEffect(() => {
    if (fetcher.data?.errors) {
      updateFormErrors(fetcher.data.errors)
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

  const onRemoveExpense = (index: number) => {
    const newExpenses = [...expenses]
    newExpenses.splice(index, 1)
    setExpenses(newExpenses)
  }

  const onChangeExpense = (
    index: number,
    expense: Partial<TransactionExpenseInput>,
  ) => {
    const newExpenses = [...expenses]
    newExpenses[index] = expense
    setExpenses(newExpenses)
  }

  return (
    <Form className="grid gap-4 p-8 lg:grid-cols-2" onSubmit={onSubmit}>
      <label>
        {t('common.title')}
        <input
          name="title"
          className={cxFormInput({ hasError: formErrors.title })}
        />
      </label>
      <label>
        {t('common.date')}
        <input
          className={cxFormInput({ hasError: formErrors.date })}
          name="date"
        />
      </label>
      <div>
        <h3 className="lg:col-span-2">{t('common.expenses')}</h3>
        <p
          className={cxWithGrowFadeMd(
            'text-red font-bold',
            Boolean(formErrors.expenses),
          )}
        >
          {formErrors.expenses}
        </p>
        <div className="flex flex-col gap-2">
          {expenses.map((expense, index) => (
            <TransactionExpenseInputGroup
              key={index}
              index={index}
              onChange={onChangeExpense}
              onRemove={onRemoveExpense}
              canRemove={index === 0 && expenses.length <= 1}
              initialData={expense}
            />
          ))}
        </div>
      </div>
    </Form>
  )
}
