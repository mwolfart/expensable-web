import type { ChangeEvent } from 'react'
import type { Category } from '@prisma/client'
import type { TransactionExpenseInput } from '~/utils/types'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { BsTrash } from 'react-icons/bs'
import { useTranslations } from 'use-intl'
import { CurrencyInput } from './currency-input'
import { formatCurrency } from '~/utils'

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
  const categoryFetcher = useFetcher()
  const [categories, setCategories] = useState<Category[]>([])
  const [data, setData] = useState<Partial<TransactionExpenseInput>>({})

  useEffect(() => {
    if (categoryFetcher.state === 'idle' && !categoryFetcher.data) {
      categoryFetcher.load('/categories')
    }
  }, [categoryFetcher])

  useEffect(() => {
    if (categoryFetcher.data?.categories) {
      const fetchedCategories = categoryFetcher.data.categories as Category[]
      setCategories(fetchedCategories)
    }
  }, [categoryFetcher.data])

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
          defaultValue={
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
          defaultValue={
            initialData?.amount ? formatCurrency(initialData.amount) : undefined
          }
        />
      </label>
      <label className="lg:max-2xl:flex-grow">
        {t('common.category')}
        <select
          onChange={changeText}
          name="categoryId"
          defaultValue={initialData?.categoryId}
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
