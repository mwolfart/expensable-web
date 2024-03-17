import type { SerializeFrom } from '@remix-run/server-runtime'
import type {
  FetcherResponse,
  ExpenseWithCategory,
  TransactionExpenseInput,
  TransactionWithExpenses,
} from '~/utils/types'
import { useState, useEffect, useContext } from 'react'
import { Form, useFetcher } from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { TransactionExpenseRow } from './transaction-expense-row'
import { cxFormInput, cxWithFade } from '~/utils/helpers'
import { AiOutlinePlus } from 'react-icons/ai'
import { BeatLoader } from 'react-spinners'
import { TransactionNewExpenseRow } from './transaction-new-expense-row'
import { FaTimes } from 'react-icons/fa'
import { ToastContext, ToastType } from '../../../providers/toast'
import { v4 as uuidv4 } from 'uuid'
import { useFormik } from 'formik'
import { transactionSchema } from '~/utils/schemas/form'

type Props = {
  onGoBack: () => unknown
  initialData?: SerializeFrom<TransactionWithExpenses>
  initialExpenses?: ExpenseWithCategory[]
  isLoadingExpenses?: boolean
}

export function UpsertTransactionForm({
  onGoBack,
  initialData,
  initialExpenses,
  isLoadingExpenses,
}: Props) {
  const t = useTranslations()
  const fetcher = useFetcher<FetcherResponse>()
  const { showToast } = useContext(ToastContext)

  const [expenses, setExpenses] = useState<TransactionExpenseInput[]>([])
  const [dirtyExpenses, setDirtyExpenses] = useState<string[]>([])
  const [expensesToAdd, setExpensesToAdd] = useState(0)
  const [expenseError, setExpenseError] = useState<string>()

  const initialFormData = initialData
    ? {
        title: initialData.location,
        date: new Date(initialData.datetime).toISOString().substring(0, 10),
      }
    : {
        title: '',
        date: '',
      }

  const { values, errors, handleSubmit, setFieldValue, setFieldError } =
    useFormik({
      initialValues: initialFormData,
      validationSchema: transactionSchema,
      validateOnBlur: false,
      validateOnChange: false,
      onSubmit: (form) => {
        const data = new FormData()
        data.set('title', form.title)
        data.set('date', form.date.toString())
        if (initialData) {
          data.set('id', initialData.id)
        }
        data.set('expenses', JSON.stringify(expenses))
        fetcher.submit(data, { method: 'put', action: '/transactions' })
      },
    })

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
    if (fetcher.data?.errors?.expenses) {
      setExpenseError(fetcher.data?.errors?.expenses)
    } else if (fetcher.data?.errors) {
      showToast(ToastType.ERROR, fetcher.data?.errors)
    } else if (fetcher.data?.success) {
      showToast(
        ToastType.SUCCESS,
        initialData ? t('transactions.saved') : t('transactions.created'),
      )
      onGoBack()
    }
  }, [fetcher.data])

  const onCancelDirtyExpense = (key: string) => {
    setDirtyExpenses(dirtyExpenses.filter((k) => k !== key))
  }

  const onAddNewDirtyExpenses = () => {
    setDirtyExpenses([
      ...dirtyExpenses,
      ...Array.from(Array(expensesToAdd + 1)).map(() => uuidv4()),
    ])
    setExpensesToAdd(0)
  }

  const onRemoveExpense = (index: number) => {
    const newExpenses = [...expenses]
    newExpenses.splice(index, 1)
    setExpenses(newExpenses)
  }

  const onAddExpense = (key: string, data: TransactionExpenseInput) => {
    const newExpenses = [...expenses]
    newExpenses.push(data)
    setExpenses(newExpenses)
    onCancelDirtyExpense(key)
  }

  return (
    <Form
      className="grid h-full grid-rows-[min-content] gap-8 lg:grid-cols-2 pb-8"
      onSubmit={handleSubmit}
    >
      <label>
        {t('common.title')}
        <input
          name="title"
          className={cxFormInput({ hasError: errors.title })}
          value={values.title}
          onChange={(e) => setFieldValue('title', e.target.value)}
          onBlur={() => setFieldError('title', undefined)}
        />
      </label>
      <label>
        {t('common.date')}
        <input
          className={cxFormInput({ hasError: errors.date })}
          name="date"
          type="date"
          value={values.date}
          onChange={(e) => setFieldValue('date', e.target.value)}
          onBlur={() => setFieldError('title', undefined)}
        />
      </label>
      <div className="flex flex-col lg:col-span-2">
        <div className="flex flex-grow flex-col gap-4 pb-8">
          <div className="flex items-center gap-4">
            <h3>{t('common.expenses')}</h3>
            <p
              className={cxWithFade(
                'flex-grow font-bold text-error',
                Boolean(expenseError),
              )}
            >
              {expenseError}
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
                  {dirtyExpenses.map((key) => (
                    <TransactionNewExpenseRow
                      key={key}
                      onCancel={() => onCancelDirtyExpense(key)}
                      onAdd={(expense) => onAddExpense(key, expense)}
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
                  disabled={dirtyExpenses.length === 0}
                  className="btn-secondary btn flex w-fit gap-2 text-white"
                  onClick={() => setDirtyExpenses([])}
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
              isLoadingExpenses || dirtyExpenses.length > 0 || !expenses.length
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
