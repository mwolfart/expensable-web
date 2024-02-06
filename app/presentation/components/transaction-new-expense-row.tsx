import type { ChangeEvent } from 'react'
import type { TransactionExpenseInput } from '~/utils/types'
import { useContext, useState } from 'react'
import { useTranslations } from 'use-intl'
import { CurrencyInput } from './currency-input'
import { CategoryContext } from '~/presentation/providers/category'
import { FaCheck, FaTimes } from 'react-icons/fa'

type Props = {
  onCancel: () => unknown
  onAdd: (data: TransactionExpenseInput) => unknown
}

export function TransactionNewExpenseRow({ onCancel, onAdd }: Props) {
  const t = useTranslations()
  const [data, setData] = useState<Partial<TransactionExpenseInput>>({
    installments: 1,
  })
  const { list: categories } = useContext(CategoryContext)

  const changeText = (
    evt: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = evt.target
    const newData = {
      ...data,
      [name]: value,
    }
    setData(newData)
  }

  const changeNumber = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target
    const newData = {
      ...data,
      [name]: parseFloat(value.replace(/[^0-9.]/g, '')),
    }
    setData(newData)
  }

  const isDataValid = data.title && data.amount && data.installments

  return (
    <>
      <div>
        <input
          className="input bg-white w-full"
          name="title"
          required
          onChange={changeText}
          aria-label={t('common.title')}
          placeholder={t('common.title')}
        />
      </div>
      <div>
        <CurrencyInput
          className="input w-full bg-white"
          name="unit"
          onChange={changeNumber}
          aria-label={t('common.unit')}
          placeholder={t('common.unit')}
        />
      </div>
      <div>
        <CurrencyInput
          className="input w-full bg-white"
          name="amount"
          onChange={changeNumber}
          aria-label={t('common.amount')}
          placeholder={t('common.amount')}
        />
      </div>
      <div>
        <select
          onChange={changeText}
          name="categoryId"
          className="input bg-white w-full"
          aria-label={t('common.category')}
        >
          <option value={undefined}>{t('common.select-option')}</option>
          {categories.map(({ id, title }) => (
            <option value={id} key={id}>
              {title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <input
          className="input w-full bg-white"
          name="installments"
          aria-label={t('common.installments')}
          placeholder={t('common.installments')}
          defaultValue={1}
          onChange={changeNumber}
        />
      </div>
      <div className="hidden sm:max-lg:block" />
      <div className="flex gap-2 sm:max-lg:col-start-2 justify-end">
        <button
          className="btn-outline btn-primary btn"
          aria-label={t('common.cancel')}
          onClick={onCancel}
          type="button"
        >
          <FaTimes size={20} />
        </button>
        <button
          className="btn-outline btn-primary btn"
          onClick={() => onAdd(data as TransactionExpenseInput)}
          disabled={!isDataValid}
          aria-label={t('common.submit')}
          type="button"
        >
          <FaCheck size={20} />
        </button>
      </div>
    </>
  )
}
