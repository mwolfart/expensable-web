import type { FormEventHandler } from 'react'
import type {
  AddTransactionFormErrors,
  ExpenseWithCategory,
  TransactionExpenseInput,
  TransactionWithExpenses,
} from '~/utils/types'
import { useState, useReducer, useEffect } from 'react'
import { Form, useFetcher } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { TransactionExpenseRow } from './transaction-expense-row'
import { cxFormInput, cxWithFade } from '~/utils'
import { AiOutlinePlus } from 'react-icons/ai'
import { BeatLoader } from 'react-spinners'
import { TransactionNewExpenseRow } from './transaction-new-expense-row'

type Props = {
  onGoBack: () => unknown
  initialData?: TransactionWithExpenses
  initialExpenses?: ExpenseWithCategory[]
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
  const [expenses, setExpenses] = useState<TransactionExpenseInput[]>([])
  const [isAddingExpense, setAddingExpense] = useState(false)

  useEffect(() => {
    if (initialExpenses) {
      setExpenses(
        initialExpenses.map(
          ({ id, title, amount, unit, categories, installments }) => ({
            id,
            title,
            amount,
            unit,
            installments,
            categoryId: categories[0].categoryId,
          }),
        ),
      )
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

  const onAddExpense = (data: TransactionExpenseInput) => {
    const newExpenses = [...expenses]
    newExpenses.push(data)
    setExpenses(newExpenses)
    setAddingExpense(false)
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
              <div className="max-lg:bg-gradient-to-r from-grey to-primary flex flex-col gap-y-[1px] lg:gap-2 lg:grid lg:grid-cols-6-shrink-last">
                <div className="hidden lg:grid lg:grid-cols-[subgrid] font-bold bg-foreground col-span-6">
                  <span>{t('common.name')}</span>
                  <span>
                    {t('common.optional-field', { field: t('common.unit') })}
                  </span>
                  <span>{t('common.amount')}</span>
                  <span>{t('common.category')}</span>
                  <span>{t('common.installments')}</span>
                  <span></span>
                </div>
                <div className="bg-foreground grid max-lg:grid-rows-4 max-lg:grid-flow-col max-lg:py-2 lg:items-center lg:grid-cols-[subgrid] lg:col-span-6">
                  {expenses.map((expense, index) => (
                    <TransactionExpenseRow
                      key={index}
                      index={index}
                      onRemove={onRemoveExpense}
                      canRemove={index === 0 && expenses.length <= 1}
                      expense={expense}
                    />
                  ))}
                </div>
                <div className="bg-foreground grid sm:max-lg:grid-cols-2 max-lg:gap-2 max-lg:py-2 lg:grid-cols-[subgrid] lg:col-span-6">
                  {isAddingExpense && (
                    <TransactionNewExpenseRow
                      onCancel={() => setAddingExpense(false)}
                      onAdd={onAddExpense}
                    />
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary btn flex w-fit gap-2 text-white"
                onClick={() => setAddingExpense(true)}
                disabled={isAddingExpense}
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
            disabled={isLoadingExpenses || isAddingExpense}
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
