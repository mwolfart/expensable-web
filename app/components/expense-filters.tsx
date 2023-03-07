import type { FormEventHandler } from 'react'
import type { Category } from '@prisma/client'
import { useTranslations } from 'use-intl'
import Select, { components } from 'react-select'

type Props = {
  onApplyFilters: () => void
  categories: Category[]
}

export function ExpenseFilters({ onApplyFilters, categories }: Props) {
  const t = useTranslations()

  const catOptions = categories.map((c) => ({ value: c.id, label: c.title }))

  const submit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    onApplyFilters()
    console.log(evt)
  }

  return (
    <form className="flex flex-col gap-4 lg:flex-row" onSubmit={submit}>
      <label className="">
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
      <label className="lg:flex-grow">
        {t('common.categories')}
        <Select
          isMulti
          name="categories"
          options={catOptions}
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
