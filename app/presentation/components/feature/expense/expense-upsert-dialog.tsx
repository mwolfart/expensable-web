import type { SerializeFrom } from '@remix-run/server-runtime'
import type { ExpenseWithCategory, FetcherResponse } from '~/utils/types'
import type { Tag } from '../../ui/tag-input'
import { useContext, useEffect, useId, useState } from 'react'
import { useTranslations } from 'use-intl'
import { CurrencyInput } from '../../ui/currency-input'
import { Form, useFetcher } from '@remix-run/react'
import { DialogContext } from '~/presentation/providers/dialog'
import { cxFormInput } from '~/utils/helpers'
import { CategoryContext } from '~/presentation/providers/category'
import { TagInput } from '../../ui/tag-input'
import { ToastContext, ToastType } from '../../../providers/toast'
import { useFormik } from 'formik'
import { expenseSchema } from '~/utils/schemas/form'

const MAX_CATEGORIES = 3

type Props = {
  onUpserted?: () => unknown
  initialData?: SerializeFrom<ExpenseWithCategory>
}

export function UpsertExpenseDialog({ onUpserted, initialData }: Props) {
  const t = useTranslations()
  const fetcher = useFetcher<FetcherResponse>()
  const { list: categories, map: categoryMap } = useContext(CategoryContext)
  const tagInputId = useId()

  const { closeDialog } = useContext(DialogContext)
  const { showToast } = useContext(ToastContext)
  const [tags, setTags] = useState<Tag[]>([])
  const suggestions = categories.map(({ id, title }) => ({ id, text: title }))

  const initialFormData = initialData
    ? {
        name: initialData.title,
        date: new Date(initialData.datetime).toISOString().substring(0, 10),
        amount: initialData.amount,
        unit: initialData.unit,
        installments: initialData.installments,
      }
    : {
        name: '',
        date: '',
        unit: undefined,
        amount: 0,
        installments: 1,
      }

  const { values, errors, handleSubmit, setFieldValue, setFieldError } =
    useFormik({
      initialValues: initialFormData,
      validationSchema: expenseSchema,
      validateOnBlur: false,
      validateOnChange: false,
      onSubmit: (form) => {
        const data = new FormData()
        data.set('name', form.name)
        data.set('date', form.date.toString())
        data.set('amount', form.amount.toString())
        if (form.unit) {
          data.set('unit', form.unit.toString())
        }
        data.set('installments', form.installments.toString())
        if (initialData) {
          data.set('id', initialData.id)
        }
        data.set('categories', JSON.stringify(tags))
        fetcher.submit(data, { method: 'put', action: '/expenses' })
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
      onUpserted && onUpserted()
      closeDialog()
    }
  }, [closeDialog, fetcher.data, onUpserted])

  useEffect(() => {
    if (initialData?.categories) {
      const initialTags = initialData.categories
        .map(({ categoryId }) => {
          const title = categoryMap.get(categoryId)
          if (title) {
            return {
              id: categoryId,
              text: categoryMap.get(categoryId) || '',
            }
          }
          return null
        })
        .filter((item) => item !== null)
      setTags(initialTags as Tag[])
    }
  }, [categoryMap, initialData?.categories])

  const onCategoryDelete = (id: number | string) => {
    setTags(tags.filter(({ id: index }) => id !== index))
  }

  const onCategoryAdd = (tag: Tag) => {
    if (tags.length < MAX_CATEGORIES) {
      setTags([...tags, tag])
    }
  }

  return (
    <Form className="grid grid-cols-4 gap-4 items-end" onSubmit={handleSubmit}>
      <label className="col-span-4">
        {t('common.name')}
        <input
          required
          className={cxFormInput({ hasError: errors.name })}
          value={values.name}
          name="name"
          onChange={(e) => setFieldValue('name', e.target.value)}
          onBlur={() => setFieldError('name', undefined)}
        />
      </label>
      <label className="col-span-2">
        {t('common.amount')}
        <CurrencyInput
          required
          name="amount"
          value={values.amount.toString()}
          className={cxFormInput({ hasError: errors.amount })}
          onChange={(e) =>
            setFieldValue(
              'amount',
              parseFloat(e.target.value.replace(/[^0-9.]/g, '')),
            )
          }
          onBlur={() => setFieldError('amount', undefined)}
        />
      </label>
      <label className="col-span-2">
        {t('common.optional-field', { field: t('common.unit') })}
        <CurrencyInput
          className={cxFormInput({ hasError: errors.unit })}
          name="unit"
          value={values.unit?.toString()}
          onChange={(e) =>
            setFieldValue(
              'unit',
              parseFloat(e.target.value.replace(/[^0-9.]/g, '')),
            )
          }
          onBlur={() => setFieldError('unit', undefined)}
        />
      </label>
      <label className="col-span-4 sm:col-span-3">
        {t('common.date')}
        <input
          type="date"
          className={cxFormInput({ hasError: errors.date })}
          name="date"
          value={values.date}
          onChange={(e) => setFieldValue('date', e.target.value)}
          onBlur={() => setFieldError('date', undefined)}
        />
      </label>
      <label className="col-span-4 sm:col-span-1">
        {t('common.installments')}
        <input
          type="number"
          className={cxFormInput({ hasError: errors.installments })}
          name="installments"
          value={values.installments}
          onChange={(e) => setFieldValue('installments', e.target.value)}
          onBlur={() => setFieldError('installments', undefined)}
        />
      </label>
      <label className="col-span-4" htmlFor={tagInputId}>
        {t('common.optional-field', { field: t('common.categories') })}
        <TagInput
          tags={tags}
          suggestions={suggestions}
          onTagAdd={onCategoryAdd}
          onTagDelete={onCategoryDelete}
          inputId={tagInputId}
        />
      </label>
      <div className="col-span-2 mt-8 flex w-full flex-row justify-between gap-4">
        <button type="submit" className="btn-primary btn flex-grow">
          {t('common.submit')}
        </button>
        <button
          type="button"
          className="btn-outline btn-primary btn flex-grow"
          onClick={closeDialog}
        >
          {t('common.cancel')}
        </button>
      </div>
    </Form>
  )
}
