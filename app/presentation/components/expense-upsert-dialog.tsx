import type { SerializeFrom } from '@remix-run/server-runtime'
import type { FormEventHandler } from 'react'
import type {
  AddExpenseFormErrors,
  ExpenseWithCategory,
  FetcherResponse,
} from '~/utils/types'
import type { Tag } from './tag-input'
import { useContext, useEffect, useId, useReducer, useState } from 'react'
import { useTranslations } from 'use-intl'
import { CurrencyInput } from './currency-input'
import { Form, useFetcher } from '@remix-run/react'
import { DialogContext } from '~/presentation/providers/dialog'
import { cxFormInput, formatCurrency } from '~/utils/helpers'
import { CategoryContext } from '~/presentation/providers/category'
import { TagInput } from './tag-input'
import { ToastContext, ToastType } from '../providers/toast'

const MAX_CATEGORIES = 3

type Props = {
  onUpserted?: () => unknown
  initialData?: SerializeFrom<ExpenseWithCategory>
}

const errorsReducer = (
  state: AddExpenseFormErrors,
  action: AddExpenseFormErrors,
) => ({
  ...state,
  ...action,
})

export function UpsertExpenseDialog({ onUpserted, initialData }: Props) {
  const t = useTranslations()
  const fetcher = useFetcher<FetcherResponse>()
  const { list: categories, map: categoryMap } = useContext(CategoryContext)
  const tagInputId = useId()

  const { closeDialog } = useContext(DialogContext)
  const { showToast } = useContext(ToastContext)
  const [tags, setTags] = useState<Tag[]>([])
  const [isFixed, setFixed] = useState(false)
  const suggestions = categories.map(({ id, title }) => ({ id, text: title }))

  const initialErrors = {
    name: '',
    amount: '',
    unit: '',
    date: '',
    categories: '',
  }

  const [formErrors, updateFormErrors] = useReducer(
    errorsReducer,
    initialErrors,
  )

  useEffect(() => {
    if (fetcher.data?.errors) {
      updateFormErrors(fetcher.data.errors)
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

  const onSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const data = new FormData(evt.currentTarget)
    if (initialData) {
      data.set('id', initialData.id)
    }
    data.set('isFixed', Boolean(isFixed).toString())
    data.set('categories', JSON.stringify(tags))
    fetcher.submit(data, { method: 'put', action: '/expenses' })
  }

  const onCategoryDelete = (id: number | string) => {
    setTags(tags.filter(({ id: index }) => id !== index))
  }

  const onCategoryAdd = (tag: Tag) => {
    if (tags.length < MAX_CATEGORIES) {
      setTags([...tags, tag])
    }
  }

  const initialAmount =
    initialData?.amount && formatCurrency(initialData?.amount)
  const initialUnit = initialData?.unit && formatCurrency(initialData?.unit)

  return (
    <Form
      className="grid grid-cols-4 gap-4 items-end"
      onSubmit={onSubmit}
      onChange={() => updateFormErrors({})}
    >
      <label className="col-span-4">
        {t('common.name')}
        <input
          required
          className={cxFormInput({ hasError: formErrors.name })}
          name="name"
          defaultValue={initialData?.title}
        />
      </label>
      <label className="col-span-4 flex flex-row-reverse justify-self-start gap-2">
        {t('common.this-is-fixed')}
        <input
          type="checkbox"
          name="isFixed"
          checked={isFixed}
          onChange={(evt) => setFixed(evt.target.checked)}
        />
      </label>
      <label className="col-span-2">
        {isFixed ? t('common.amount-per-month') : t('common.amount')}
        <CurrencyInput
          required
          name="amount"
          className={cxFormInput({ hasError: formErrors.amount })}
          value={initialAmount?.toString()}
        />
      </label>
      <label className="col-span-2">
        {t('common.optional-field', { field: t('common.unit') })}
        <CurrencyInput
          className={cxFormInput({ hasError: formErrors.unit })}
          name="unit"
          value={initialUnit?.toString()}
        />
      </label>
      <label className="col-span-4 sm:col-span-3">
        {t('common.date')}
        <input
          type="date"
          className={cxFormInput({ hasError: formErrors.date })}
          name="date"
          defaultValue={
            initialData?.datetime &&
            new Date(initialData.datetime).toISOString().substring(0, 10)
          }
        />
      </label>
      <label className="col-span-4 sm:col-span-1">
        {t('common.installments')}
        <input
          type="number"
          className={cxFormInput({ hasError: formErrors.installments })}
          name="installments"
          defaultValue={initialData?.installments || 1}
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
        <button className="btn-primary btn flex-grow">
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
