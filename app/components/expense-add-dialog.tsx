import {
  FormEventHandler,
  MouseEventHandler,
  useContext,
  useEffect,
  useId,
  useState,
} from 'react'
import { useTranslations } from 'use-intl'
import { CurrencyInput } from './currency-input'
import { WithContext as ReactTags, Tag } from 'react-tag-input'
import { useFetcher } from '@remix-run/react'
import { Category } from '@prisma/client'
import { DialogContext } from '~/providers/dialog'

export function AddExpenseDialog() {
  const t = useTranslations()
  const fetcher = useFetcher()
  const { closeDialog } = useContext(DialogContext)
  const [tags, setTags] = useState<Tag[]>([])
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const tagInputId = useId()

  useEffect(() => {
    fetcher.load('/categories')
  }, [])

  useEffect(() => {
    if (fetcher.data?.categories) {
      const categorySuggestions = fetcher.data?.categories.map(
        (cat: Category) => ({ id: cat.id, text: cat.title }),
      )
      setSuggestions(categorySuggestions)
    }
  }, [fetcher.data])

  const onSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    console.log(evt)
  }

  const onCategoryDelete = (id: number) => {
    setTags(tags.filter((_, index) => index !== id))
  }

  const onCategoryAdd = (tag: Tag) => {
    setTags([...tags, tag])
  }

  const onTagWrapperClick: MouseEventHandler = (evt) => {
    evt.preventDefault()
  }

  return (
    <form className="grid grid-cols-2 gap-4 p-8" onSubmit={onSubmit}>
      <label className="col-span-2">
        {t('common.name')}
        <input required className="input" name="name" />
      </label>
      <label>
        {t('common.amount')}
        <CurrencyInput required className="input" name="amount" />
      </label>
      <label>
        {t('common.optional-field', { field: t('common.unit') })}
        <CurrencyInput className="input" name="unit" />
      </label>
      <label className="col-span-2">
        {t('common.categories')}
        <div
          className="input h-20 w-full cursor-text focus-within:outline focus-within:outline-[#ccc3]"
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
            inputProps={{ id: tagInputId }}
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
    </form>
  )
}
