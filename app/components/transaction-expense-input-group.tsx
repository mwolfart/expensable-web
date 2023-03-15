import type { ChangeEvent } from 'react'
import type { Category } from '@prisma/client'
import type { TransactionExpenseInput } from '~/utils/types'
import { useFetcher } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { BsTrash } from 'react-icons/bs'
import { useTranslations } from 'use-intl'

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

  const change = (evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = evt.target
    const newData = {
      ...data,
      [name]: value,
    }
    onChange(index, newData)
    setData(newData)
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <label>
        {t('common.name')}
        <input
          className="input"
          name="name"
          required
          onChange={change}
          defaultValue={initialData?.title}
        />
      </label>
      <label>
        {t('common.optional-field', { field: t('common.unit') })}
        <input
          className="input"
          name="unit"
          onChange={change}
          defaultValue={initialData?.unit}
        />
      </label>
      <label>
        {t('common.amount')}
        <input
          className="input"
          name="amount"
          onChange={change}
          defaultValue={initialData?.amount}
        />
      </label>
      <label>
        {t('common.category')}
        <select
          onChange={change}
          name="categoryId"
          defaultValue={initialData?.categoryId}
        >
          {categories.map(({ id, title }) => (
            <option id={id} key={id}>
              {title}
            </option>
          ))}
        </select>
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
