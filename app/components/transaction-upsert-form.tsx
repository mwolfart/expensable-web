import type { FormEventHandler } from 'react'
import type {
  AddTransactionFormErrors,
  TransactionExpenseInput,
  TransactionWithExpenses,
} from '~/utils/types'
import { useState, useReducer, useEffect } from 'react'
import { Form, useFetcher } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { TransactionExpenseInputGroup } from './transaction-expense-input-group'
import { cxFormInput, cxWithFade } from '~/utils'
import { AiOutlinePlus } from 'react-icons/ai'
import { BeatLoader } from 'react-spinners'

type Props = {
  onGoBack: () => unknown
  initialData?: TransactionWithExpenses
  initialExpenses?: TransactionExpenseInput[]
  isLoadingExpenses?: boolean
}

const errorsReducer = (
  state: AddTransactionFormErrors,
  action: AddTransactionFormErrors,
) => ({
  ...state,
  ...action,
})

export function UpsertTransactionForm({
  onGoBack,
  initialData,
  initialExpenses,
  isLoadingExpenses,
}: Props) {
  const t = useTranslations()
  const fetcher = useFetcher()

  const initialErrors = {
    title: '',
    date: '',
    expenses: '',
  }
  const [formErrors, updateFormErrors] = useReducer(
    errorsReducer,
    initialErrors,
  )
  const [expenses, setExpenses] = useState<Partial<TransactionExpenseInput>[]>(
    [],
  )

  useEffect(() => {
    if (initialExpenses) {
      setExpenses(initialExpenses)
    }
  }, [initialExpenses])

  useEffect(() => {
    if (fetcher.data?.errors) {
      updateFormErrors(fetcher.data.errors)
    } else if (fetcher.data?.success) {
      onGoBack()
    }
  }, [fetcher.data, onGoBack])

  const onSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const data = new FormData(evt.currentTarget)
    if (initialData) {
      data.set('id', initialData.id)
    }
    data.set('expenses', JSON.stringify(expenses))
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

  const onAddExpense = () => {
    const newExpenses = [...expenses]
    newExpenses.push({})
    setExpenses(newExpenses)
  }

  return (
    <Form
      className="grid h-full grid-rows-[min-content] gap-8 lg:grid-cols-2"
      onSubmit={onSubmit}
    >
      <label>
        {t('common.title')}
        <input
          name="title"
          className={cxFormInput({ hasError: formErrors.title })}
          defaultValue={initialData?.location}
        />
      </label>
      <label>
        {t('common.date')}
        <input
          className={cxFormInput({ hasError: formErrors.date })}
          name="date"
          type="date"
          defaultValue={initialData?.datetime.toISOString().substring(0, 10)}
        />
      </label>
      <div className="flex flex-col lg:col-span-2">
        <div className="flex flex-grow flex-col gap-4 pb-8">
          <div className="flex items-center gap-4">
            <h3>{t('common.expenses')}</h3>
            <p
              className={cxWithFade(
                'flex-grow font-bold text-error',
                Boolean(formErrors.expenses),
              )}
            >
              {formErrors.expenses}
            </p>
          </div>
          {isLoadingExpenses ? (
            <BeatLoader color="grey" size={10} />
          ) : (
            <>
              <div className="flex w-full flex-col bg-gradient-to-r from-grey to-primary max-xl:gap-[1px]">
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
              <button
                type="button"
                className="btn-primary btn flex w-fit gap-2 text-white"
                onClick={onAddExpense}
              >
                <AiOutlinePlus size={24} />
                {t('transactions.new-expense')}
              </button>
            </>
          )}
        </div>
        <div className="flex w-full flex-col gap-4 lg:col-span-2">
          <button
            className="btn-primary btn w-full"
            disabled={isLoadingExpenses}
          >
            {t('common.submit')}
          </button>
          <button
            type="button"
            className="btn-outline btn-primary btn w-full"
            onClick={onGoBack}
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </Form>
  )
}
