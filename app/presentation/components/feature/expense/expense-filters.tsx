import type { FormEventHandler } from 'react'
import type { ExpenseFilters } from '~/utils/types'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
// import Select, { components } from 'react-select'
import { CategoryContext } from '~/presentation/providers/category'

type Props = {
  onApplyFilters: (formData: FormData) => void
  onClearFilters: () => void
  initialFilters?: ExpenseFilters
}

type SelectOption = { value: string; label: string }

export function ExpenseFilterComponent({
  onApplyFilters,
  onClearFilters,
  initialFilters,
}: Props) {
  const { t } = useTranslation()

  const initialStartDate = initialFilters?.startDate?.toISOString().slice(0, 10)
  const initialEndDate = initialFilters?.endDate?.toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)
  const [title, setTitle] = useState(initialFilters?.title ?? '')

  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([])
  // const { list: categories, map: categoryMap } = useContext(CategoryContext)
  const { map: categoryMap } = useContext(CategoryContext)

  useEffect(() => {
    if (initialFilters?.categoriesIds) {
      const initialOptions = initialFilters.categoriesIds.map((catId) => ({
        value: catId,
        label: categoryMap.get(catId) || '',
      }))
      setSelectedOptions(initialOptions)
    }
  }, [categoryMap, initialFilters])

  // const catOptions = categories.map((c) => ({ value: c.id, label: c.title }))

  const submit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    formData.set(
      'categories',
      selectedOptions.map(({ value }) => value).toString(),
    )
    onApplyFilters(formData)
  }

  const clear = () => {
    setTitle('')
    setStartDate('')
    setEndDate('')
    setSelectedOptions([])
    onClearFilters()
  }

  return (
    <form
      className="grid gap-4 max-md:grid-cols-1 md:max-3xl:grid-cols-4 md:max-3xl:grid-rows-2 3xl:grid-cols-5"
      onSubmit={submit}
    >
      <label className="md:max-3xl:col-span-2">
        {t('common.title')}
        <input
          className="input bg-white"
          name="title"
          placeholder={t('common.title')}
          value={title}
          onChange={(evt) => setTitle(evt.target.value)}
        />
      </label>
      <label>
        {t('common.start-date')}
        <input
          className="input bg-white"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(evt) => setStartDate(evt.target.value)}
        />
      </label>
      <label>
        {t('common.end-date')}
        <input
          className="input bg-white"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(evt) => setEndDate(evt.target.value)}
        />
      </label>
      {/**
        * Commented until the issue with react-select is resolved
        * 
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
      </label> */}
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
