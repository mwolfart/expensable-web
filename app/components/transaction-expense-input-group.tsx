import type { ChangeEvent } from 'react'
import type { TransactionExpenseInput } from '~/utils/types'
import { useContext } from 'react'
import { useEffect, useState } from 'react'
import { BsTrash } from 'react-icons/bs'
import { useTranslations } from 'use-intl'
import { CurrencyInput } from './currency-input'
import { formatCurrency } from '~/utils'
import { CategoryContext } from '~/providers/category'

type Props = {
  index: number
  onRemove: (index: number) => unknown
  onChange: (index: number, data: Partial<TransactionExpenseInput>) => unknown
  canRemove: boolean
  initialData?: Partial<TransactionExpenseInput>
}

export function TransactionExpenseInputGroup({
  index,
  onRemove,
  onChange,
  canRemove,
  initialData,
}: Props) {
  const t = useTranslations()
  const [data, setData] = useState<Partial<TransactionExpenseInput>>({})
  const { list: categories } = useContext(CategoryContext)

  useEffect(() => {
    if (initialData) {
      setData(initialData)
    }
  }, [initialData])

  const changeText = (
    evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = evt.target
    const newData = {
      ...data,
      [name]: value,
    }
    onChange(index, newData)
    setData(newData)
  }

  const changeNumber = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target
    const newData = {
      ...data,
      [name]: parseFloat(value.replace(/[^0-9.]/g, '')),
    }
    onChange(index, newData)
    setData(newData)
  }

  return (
    <div className="flex w-full flex-col items-end gap-4 bg-foreground py-4 lg:flex-row lg:flex-wrap xl:flex-nowrap xl:py-1 max-lg:[&>*]:w-full">
      <label className="flex-grow">
        {t('common.name')}
        <input
          className="input"
          name="title"
          required
          onChange={changeText}
          defaultValue={initialData?.title}
        />
      </label>
      <label>
        {t('common.optional-field', { field: t('common.unit') })}
        <CurrencyInput
          className="input w-full"
          name="unit"
          onChange={changeNumber}
          value={
            initialData?.unit ? formatCurrency(initialData.unit) : undefined
          }
        />
      </label>
      <label>
        {t('common.amount')}
        <CurrencyInput
          className="input w-full"
          name="amount"
          onChange={changeNumber}
          value={
            initialData?.amount ? formatCurrency(initialData.amount) : undefined
          }
        />
      </label>
      <label className="lg:max-2xl:flex-grow">
        {t('common.category')}
        <select
          onChange={changeText}
          name="categoryId"
          value={initialData?.categoryId}
          className="input"
        >
          <option value={undefined}>{t('common.select-option')}</option>
          {categories.map(({ id, title }) => (
            <option value={id} key={id}>
              {title}
            </option>
          ))}
        </select>
      </label>
      <label className="flex-shrink">
        {t('common.installments')}
        <input
          className="input w-full"
          name="installments"
          onChange={changeNumber}
          value={initialData?.installments || 1}
        />
      </label>
      <button
        className="btn-outline btn-primary btn"
        onClick={() => onRemove(index)}
        disabled={canRemove}
      >
        <BsTrash size={20} />
      </button>
    </div>
  )
}
