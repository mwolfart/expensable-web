import { useState, type FormEventHandler } from 'react'
import type { TransactionFilters } from '~/utils/types'
import { useTranslations } from 'use-intl'

type Props = {
  onApplyFilters: (formData: FormData) => void
  onClearFilters: () => void
  initialFilters?: TransactionFilters
}

export function TransactionFilterComponent({
  onApplyFilters,
  onClearFilters,
  initialFilters,
}: Props) {
  const t = useTranslations()
  const initialStartDate = initialFilters?.startDate?.toISOString().slice(0, 10)
  const initialEndDate = initialFilters?.endDate?.toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)

  const clear = () => {
    setStartDate('')
    setEndDate('')
    onClearFilters()
  }

  const submit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    if (startDate && endDate) {
      const formData = new FormData()
      formData.set('startDate', startDate)
      formData.set('endDate', endDate)
      onApplyFilters(formData)
    }
  }

  return (
    <form
      className="grid gap-4 max-md:grid-cols-1 md:grid-cols-3"
      onSubmit={submit}
    >
      <label>
        {t('common.start-date')}
        <input
          className="input"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(evt) => setStartDate(evt.target.value)}
        />
      </label>
      <label>
        {t('common.end-date')}
        <input
          className="input"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(evt) => setEndDate(evt.target.value)}
        />
      </label>
      <div className="flex w-full flex-row items-end gap-4 md:max-lg:col-span-2">
        <button className="btn-primary btn flex-grow">
          {t('common.apply')}
        </button>
        <button
          type="button"
          className="btn-outline btn-primary btn flex-grow"
          onClick={clear}
        >
          {t('common.clear')}
        </button>
      </div>
    </form>
  )
}
