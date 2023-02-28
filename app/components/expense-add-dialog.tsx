import {
  FormEventHandler,
  MouseEventHandler,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'
import { useTranslations } from 'use-intl'
import { CurrencyInput } from './currency-input'
import { WithContext as ReactTags, Tag } from 'react-tag-input'
import { Form, useFetcher } from '@remix-run/react'
import { Category } from '@prisma/client'
import { DialogContext } from '~/providers/dialog'
import { AddExpenseFormErrors } from '~/utils/types'
import { cxFormInput } from '~/utils'

const MAX_CATEGORIES = 3

type Props = {
  categories: Category[]
  onUpserted: () => unknown
}

const errorsReducer = (
  state: AddExpenseFormErrors,
  action: AddExpenseFormErrors,
) => ({
  ...state,
  ...action,
})

export function UpsertExpenseDialog({ onUpserted, categories }: Props) {
  const t = useTranslations()
  const fetcher = useFetcher()
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
  }, [fetcher.data])

  const onSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const data = new FormData(evt.currentTarget)
    data.set('categories', JSON.stringify(tags))
    fetcher.submit(data, { method: 'post', action: '/expenses' })
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

  return (
    <Form
      className="grid grid-cols-2 gap-4 p-8"
      onSubmit={onSubmit}
      onChange={() => updateFormErrors({})}
    >
      <label className="col-span-2">
        {t('common.name')}
        <input
          required
          className={cxFormInput({ hasError: formErrors.name })}
          name="name"
        />
      </label>
      <label>
        {t('common.amount')}
        <CurrencyInput
          required
          name="amount"
          className={cxFormInput({ hasError: formErrors.amount })}
        />
      </label>
      <label>
        {t('common.optional-field', { field: t('common.unit') })}
        <CurrencyInput
          className={cxFormInput({ hasError: formErrors.unit })}
          name="unit"
        />
      </label>
      <label className="col-span-2">
        {t('common.date')}
        <input
          type="date"
          className={cxFormInput({ hasError: formErrors.date })}
          name="date"
        />
      </label>
      <label className="col-span-2">
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
