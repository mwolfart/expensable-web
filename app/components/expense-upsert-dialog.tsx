import type { FormEventHandler, MouseEventHandler } from 'react'
import type { Tag } from 'react-tag-input'
import type { AddExpenseFormErrors, ExpenseWithCategory } from '~/utils/types'
import { useContext, useEffect, useReducer, useState } from 'react'
import { useTranslations } from 'use-intl'
import { CurrencyInput } from './currency-input'
import { WithContext as ReactTags } from 'react-tag-input'
import { Form, useFetcher } from '@remix-run/react'
import { DialogContext } from '~/providers/dialog'
import { cxFormInput, formatCurrency } from '~/utils'
import { CategoryContext } from '~/providers/category'

const MAX_CATEGORIES = 3

type Props = {
  onUpserted: () => unknown
  initialData?: ExpenseWithCategory
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
  const fetcher = useFetcher()
  const { list: categories, map: categoryMap } = useContext(CategoryContext)

  const { closeDialog } = useContext(DialogContext)
  const [tags, setTags] = useState<Tag[]>([])
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
      onUpserted()
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
    data.set('categories', JSON.stringify(tags))
    fetcher.submit(data, { method: 'put', action: '/expenses' })
  }

  const onCategoryDelete = (id: number) => {
    setTags(tags.filter((_, index) => index !== id))
  }

  const onCategoryAdd = (tag: Tag) => {
    if (tags.length < MAX_CATEGORIES) {
      setTags([...tags, tag])
    }
  }

  const onTagWrapperClick: MouseEventHandler = (evt) => {
    evt.preventDefault()
  }

  const initialAmount =
    initialData?.amount && formatCurrency(initialData?.amount)
  const initialUnit = initialData?.unit && formatCurrency(initialData?.unit)

  return (
    <Form
      className="grid grid-cols-4 gap-4"
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
      <label className="col-span-2">
        {t('common.amount')}
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
      <label className="col-span-3">
        {t('common.date')}
        <input
          type="date"
          className={cxFormInput({ hasError: formErrors.date })}
          name="date"
          defaultValue={initialData?.datetime.toISOString().substring(0, 10)}
        />
      </label>
      <label>
        {t('common.installments')}
        <input
          type="number"
          className={cxFormInput({ hasError: formErrors.installments })}
          name="installments"
          defaultValue={initialData?.installments || 1}
        />
      </label>
      <label className="col-span-4">
        {t('common.optional-field', { field: t('common.categories') })}
        <div
          className={cxFormInput({
            hasError: formErrors.categories,
            extraClasses:
              'h-28 cursor-text focus-within:outline focus-within:outline-[#ccc3]',
          })}
          onClick={onTagWrapperClick}
        >
          <ReactTags
            tags={tags}
            suggestions={suggestions}
            handleDelete={onCategoryDelete}
            handleAddition={onCategoryAdd}
            classNames={{
              tagInputField: 'outline-none w-64',
              suggestions: 'absolute py-2',
              tagInput: 'relative',
              selected: 'w-full flex flex-row flex-wrap gap-2 py-2',
              tag: 'p-1 bg-light-grey rounded-lg',
              remove: 'px-1',
            }}
            autocomplete
            allowDragDrop={false}
            allowAdditionFromPaste={false}
          />
        </div>
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
