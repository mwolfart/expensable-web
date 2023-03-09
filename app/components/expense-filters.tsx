import type { FormEventHandler } from 'react'
import type { Category } from '@prisma/client'
import type { ExpenseFilters } from '~/utils/types'
import { useEffect } from 'react'
import { useState } from 'react'
import { useTranslations } from 'use-intl'
import Select, { components } from 'react-select'

type Props = {
  onApplyFilters: (formData: FormData) => void
  onClearFilters: () => void
  categoryMap: Map<string, string>
  categories: Category[]
  initialFilters?: ExpenseFilters
}

type SelectOption = { value: string; label: string }

export function ExpenseFilterComponent({
  onApplyFilters,
  onClearFilters,
  categoryMap,
  categories,
  initialFilters,
}: Props) {
  const t = useTranslations()
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([])

  useEffect(() => {
    if (initialFilters?.categoriesIds) {
      const initialOptions = initialFilters.categoriesIds.map((catId) => ({
        value: catId,
        label: categoryMap.get(catId) || '',
      }))
      setSelectedOptions(initialOptions)
    }
  }, [categoryMap, initialFilters])

  const catOptions = categories.map((c) => ({ value: c.id, label: c.title }))

  const submit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    formData.set(
      'categories',
      selectedOptions.map(({ value }) => value).toString(),
    )
    onApplyFilters(formData)
  }

  return (
    <form
      className="grid gap-4 max-md:grid-cols-1 md:max-3xl:grid-cols-4 md:max-3xl:grid-rows-2 3xl:grid-cols-5"
      onSubmit={submit}
    >
      <label className="md:max-3xl:col-span-2">
        {t('common.title')}
        <input
          className="input"
          name="title"
          placeholder={t('common.title')}
          defaultValue={initialFilters?.title || ''}
        />
      </label>
      <label>
        {t('common.start-date')}
        <input
          className="input"
          name="startDate"
          type="date"
          defaultValue={initialFilters?.startDate?.toISOString().slice(0, 10)}
        />
      </label>
      <label>
        {t('common.end-date')}
        <input
          className="input"
          name="endDate"
          type="date"
          defaultValue={initialFilters?.endDate?.toISOString().slice(0, 10)}
        />
      </label>
      <label className="md:max-3xl:row-start-2 md:max-lg:col-span-2 lg:max-3xl:col-span-3">
        {t('common.categories')}
        <Select
          isMulti
          value={selectedOptions}
          onChange={(o) => setSelectedOptions(Array.from(o))}
          options={catOptions}
          isOptionDisabled={() => selectedOptions.length >= 3}
          components={{
            Control: (props) => (
              <components.Control {...props} className="input" />
            ),
          }}
        />
      </label>
      <div className="flex w-full flex-row items-end gap-4 md:max-lg:col-span-2">
        <button className="btn-primary btn flex-grow">
          {t('common.apply')}
        </button>
        <button
          type="button"
          className="btn-outline btn-primary btn flex-grow"
          onClick={onClearFilters}
        >
          {t('common.clear')}
        </button>
      </div>
    </form>
  )
}
