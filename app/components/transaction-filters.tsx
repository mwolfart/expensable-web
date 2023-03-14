import type { FormEventHandler } from 'react'
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

  const submit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    onApplyFilters(formData)
  }

  return (
    <form
      className="grid gap-4 max-md:grid-cols-1 md:max-3xl:grid-cols-4 md:max-3xl:grid-rows-2 3xl:grid-cols-5"
      onSubmit={submit}
    >
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
