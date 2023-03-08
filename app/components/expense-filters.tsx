import type { FormEventHandler } from 'react'
import type { Category } from '@prisma/client'
import { useState } from 'react'
import { useTranslations } from 'use-intl'
import Select, { components } from 'react-select'

type Props = {
  onApplyFilters: (formData: FormData) => void
  categories: Category[]
}

type SelectOption = { value: string; label: string }

export function ExpenseFilters({ onApplyFilters, categories }: Props) {
  const t = useTranslations()
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([])

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
        <input className="input" name="title" placeholder={t('common.title')} />
      </label>
      <label>
        {t('common.start-date')}
        <input className="input" name="startDate" type="date" />
      </label>
      <label>
        {t('common.end-date')}
        <input className="input" name="endDate" type="date" />
      </label>
      <label className="md:max-3xl:col-span-3 md:max-3xl:row-start-2">
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
      <div className="flex flex-col justify-end">
        <button className="btn-primary btn">{t('common.apply')}</button>
      </div>
    </form>
  )
}
