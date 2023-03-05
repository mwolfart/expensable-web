import type { FormEventHandler } from 'react'
import { useTranslations } from 'use-intl'

type Props = {
  onApplyFilters: () => void
}

export function ExpenseFilters({ onApplyFilters }: Props) {
  const t = useTranslations()

  const submit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    onApplyFilters()
    console.log(evt)
  }

  return (
    <form className="flex flex-col gap-4 lg:flex-row" onSubmit={submit}>
      <label className="lg:flex-grow">
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
      <div className="flex flex-col justify-end">
        <button className="btn-primary btn">{t('common.apply')}</button>
      </div>
    </form>
  )
}
