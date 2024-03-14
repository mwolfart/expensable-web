import type { FetcherResponse } from '~/utils/types'
import type { SerializeFrom } from '@remix-run/server-runtime'
import type { FixedExpense } from '@prisma/client'
import { useContext, useEffect } from 'react'
import { useTranslations } from 'use-intl'
import { ToastContext, ToastType } from '../providers/toast'
import { Form, useFetcher } from '@remix-run/react'
import { useFormik } from 'formik'
import { cxFormInput, getMonthName } from '~/utils/helpers'
import { CategoryContext } from '../providers/category'
import { CurrencyInput } from './currency-input'
import * as yup from 'yup'

type Props = {
  onGoBack: () => unknown
  initialData?: SerializeFrom<FixedExpense> | null
  monthExpenses?: SerializeFrom<FixedExpense[]> | null
}

const schema = yup.object().shape({
  title: yup.string().required(),
  date: yup.string().required(),
  categoryId: yup.string(),
  varyingCosts: yup.boolean(),
  amount: yup.number().when('varyingCosts', {
    is: false,
    then: (schema) => schema.required(),
  }),
  amountOfMonths: yup
    .number()
    .when('varyingCosts', {
      is: false,
      then: (schema) => schema.required(),
    })
    .required(),
  amountPerMonth: yup.array(yup.number()).when('varyingCosts', {
    is: true,
    then: (schema) => schema.required(),
  }),
})

const getDateLabel = (idx: number, dateStr?: string) => {
  const today = dateStr ? new Date(dateStr) : new Date()
  const month = getMonthName((today.getMonth() + idx + 1) % 12)
  const year = today.getFullYear() + Math.floor((today.getMonth() + idx) / 12)
  return `${month} ${year}`
}

export function UpsertFixedExpenseForm({
  onGoBack,
  initialData,
  monthExpenses,
}: Props) {
  const t = useTranslations()
  const { showToast } = useContext(ToastContext)
  const fetcher = useFetcher<FetcherResponse>()
  const { list: categories } = useContext(CategoryContext)

  const { values, errors, handleSubmit, setFieldValue, setFieldError } =
    useFormik({
      initialValues: initialData
        ? {
            ...initialData,
            date: new Date(initialData.date).toISOString().substring(0, 10),
            categoryId: initialData.categoryId,
            amountPerMonth: [
              initialData.amount,
              ...(monthExpenses?.map((e) => e.amount) ?? []),
            ],
          }
        : {
            title: '',
            date: '',
            varyingCosts: false,
            amount: 0,
            amountOfMonths: 1,
            amountPerMonth: [0],
            categoryId: undefined,
          },
      validationSchema: schema,
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: async (values) => {
        const data = new FormData()
        data.set('title', values.title)
        data.set('startDate', values.date.toString())
        data.set('amount', values.amount.toString())
        data.set('amountOfMonths', values.amountOfMonths.toString())
        data.set('categoryId', values.categoryId || '')
        data.set('varyingCosts', values.varyingCosts ? '1' : '0')
        data.set('amountPerMonth', `[${values.amountPerMonth?.join(',')}]`)
        if (initialData) {
          data.set('id', initialData.id)
        }
        fetcher.submit(data, { method: 'put', action: '/fixed-expenses' })
      },
    })

  useEffect(() => {
    if (fetcher.data?.errors) {
      showToast(ToastType.ERROR, t('expenses.errors.unknown'))
    } else if (fetcher.data?.success) {
      showToast(
        ToastType.SUCCESS,
        initialData ? t('expenses.saved') : t('expenses.created'),
      )
      onGoBack()
    }
  }, [fetcher.data])

  const onChangeAmountOfMonths = (value: number) => {
    const higherAmount = value > values.amountOfMonths
    setFieldValue('amountOfMonths', value)

    if (!values.varyingCosts || !values.amountPerMonth) {
      return
    }

    if (higherAmount) {
      const difference = value - values.amountPerMonth.length
      setFieldValue('amountPerMonth', [
        ...values.amountPerMonth,
        ...Array.from(Array(difference)).fill(0),
      ])
    } else {
      setFieldValue('amountPerMonth', values.amountPerMonth.slice(0, value))
    }
  }

  return (
    <Form
      className="grid h-full grid-rows-[min-content] gap-8 lg:grid-cols-2 2xl:grid-cols-4 pb-8"
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
        {t('common.start-date')}
        <input
          name="date"
          type="date"
          className={cxFormInput({ hasError: errors.date })}
          value={values.date}
          onChange={(e) => setFieldValue('date', e.target.value)}
          onBlur={() => setFieldError('date', undefined)}
        />
      </label>
      <label>
        {t('common.number-of-months')}
        <select
          value={values.amountOfMonths}
          name="amountOfMonths"
          onChange={(e) => onChangeAmountOfMonths(parseInt(e.target.value))}
          className="input bg-white w-full"
        >
          {[...Array(20).keys()].map((i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('common.category')}
        <select
          value={values.categoryId ?? undefined}
          onChange={(e) => setFieldValue('categoryId', e.target.value)}
          name="categoryId"
          className="input bg-white w-full"
        >
          <option value={undefined}>{t('common.select-option')}</option>
          {categories.map(({ id, title }) => (
            <option value={id} key={id}>
              {title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-row-reverse items-center justify-end 2xl:col-span-2">
        {t('expenses.varying-amounts')}
        <input
          type="checkbox"
          checked={values.varyingCosts}
          name="varyingCosts"
          onChange={(e) => setFieldValue('varyingCosts', e.target.checked)}
        />
      </label>
      {values.varyingCosts && (
        <div className="grid grid-cols-2-grow-right gap-4 lg:col-span-2 2xl:col-span-4 items-center">
          {values.amountPerMonth?.map((v, idx) => (
            <>
              <label className="whitespace-nowrap" key={`label-${idx}`}>
                {getDateLabel(idx, values.date)}
              </label>
              <CurrencyInput
                value={v?.toString()}
                key={`input-${idx}`}
                className="input"
                onChange={(e) => {
                  if (values.amountPerMonth) {
                    const newValues = [...values.amountPerMonth]
                    newValues[idx] = parseFloat(
                      e.target.value.replace(/[^0-9.]/g, ''),
                    )
                    setFieldValue('amountPerMonth', newValues)
                  }
                }}
              />
            </>
          ))}
        </div>
      )}
      {!values.varyingCosts && (
        <label className="2xl:col-span-4">
          {t('common.amount')}
          <CurrencyInput
            className="input w-full bg-white"
            name="amount"
            value={values.amount.toString()}
            onChange={(e) =>
              setFieldValue(
                'amount',
                parseFloat(e.target.value.replace(/[^0-9.]/g, '')),
              )
            }
          />
        </label>
      )}
      <div className="flex w-full flex-col gap-4 lg:col-span-2 2xl:col-span-4">
        <button className="btn-primary btn w-full">{t('common.submit')}</button>
        <button
          type="button"
          className="btn-outline btn-primary btn w-full"
          onClick={onGoBack}
        >
          {t('common.cancel')}
        </button>
      </div>
    </Form>
  )
}
