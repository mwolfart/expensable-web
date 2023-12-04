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
import { cxFormInput, cxWithFade } from '~/utils/helpers'
import { AiOutlinePlus } from 'react-icons/ai'
import { BeatLoader } from 'react-spinners'
import { TransactionNewExpenseRow } from './transaction-new-expense-row'
import { FaTimes } from 'react-icons/fa'

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
  const [numOfDirtyExpenses, setNumOfDirtyExpenses] = useState(0)
  const [expensesToAdd, setExpensesToAdd] = useState(0)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data])

  useEffect(() => {
    updateFormErrors({ ...formErrors, expenses: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numOfDirtyExpenses])

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
    setNumOfDirtyExpenses(numOfDirtyExpenses - 1)
  }

  const onAddNewDirtyExpenses = () => {
    setNumOfDirtyExpenses(numOfDirtyExpenses + expensesToAdd + 1)
    setExpensesToAdd(0)
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
          onChange={() =>
            updateFormErrors({ ...formErrors, title: '', expenses: '' })
          }
        />
      </label>
      <label>
        {t('common.date')}
        <input
          className={cxFormInput({ hasError: formErrors.date })}
          name="date"
          type="date"
          defaultValue={initialData?.datetime.toISOString().substring(0, 10)}
          onChange={() =>
            updateFormErrors({ ...formErrors, date: '', expenses: '' })
          }
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
              <div className="max-lg:bg-gradient-to-r from-grey to-primary flex flex-col gap-y-[1px] lg:gap-2 lg:grid lg:grid-cols-transaction-expense-table">
                <div className="hidden lg:grid lg:grid-cols-subgrid font-bold bg-foreground col-span-6">
                  <span>{t('common.name')}</span>
                  <span>
                    {t('common.optional-field', { field: t('common.unit') })}
                  </span>
                  <span>{t('common.amount')}</span>
                  <span>{t('common.category')}</span>
                  <span>{t('common.installments')}</span>
                  <span></span>
                </div>
                <div
                  className={`bg-foreground grid max-lg:grid-rows-4 max-lg:grid-flow-col max-lg:py-2 lg:gap-y-2
                    lg:items-center lg:grid-cols-subgrid lg:col-span-6`}
                >
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
                <div className="bg-foreground grid sm:max-lg:grid-cols-2 max-lg:gap-2 max-lg:py-2 lg:grid-cols-subgrid lg:col-span-6 lg:gap-y-2">
                  {[...Array(numOfDirtyExpenses).keys()].map((i) => (
                    <TransactionNewExpenseRow
                      key={i}
                      onCancel={() =>
                        setNumOfDirtyExpenses(numOfDirtyExpenses - 1)
                      }
                      onAdd={onAddExpense}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex gap-[2px]">
                  <select
                    className="input bg-primary rounded-tr-none rounded-br-none text-white focus:outline focus:outline-primary"
                    value={expensesToAdd}
                    onChange={(evt) =>
                      setExpensesToAdd(parseInt(evt.target.value))
                    }
                  >
                    {[...Array(9).keys()].map((i) => (
                      <option key={i} value={i}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-primary btn flex w-fit gap-2 text-white rounded-tl-none rounded-bl-none"
                    onClick={onAddNewDirtyExpenses}
                  >
                    <AiOutlinePlus size={24} />
                    {t('transactions.new-expense')}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={numOfDirtyExpenses === 0}
                  className="btn-secondary btn flex w-fit gap-2 text-white"
                  onClick={() => setNumOfDirtyExpenses(0)}
                >
                  <FaTimes size={24} />
                  {t('transactions.cancel-all')}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex w-full flex-col gap-4 lg:col-span-2">
          <button
            className="btn-primary btn w-full"
            disabled={
              isLoadingExpenses || numOfDirtyExpenses > 0 || !expenses.length
            }
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
