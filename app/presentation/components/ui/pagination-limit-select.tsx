import type { ChangeEvent } from 'react'
import { useSearchParams } from '@remix-run/react'
import { useTranslations } from 'use-intl'

type Props = {
  onChangeLimit: (evt: ChangeEvent<HTMLSelectElement>) => unknown
}

export function PaginationLimitSelect({ onChangeLimit }: Props) {
  const t = useTranslations()
  const [params] = useSearchParams()
  return (
    <label>
      {t('common.entries')}
      <select
        className="input"
        onChange={onChangeLimit}
        defaultValue={params.get('limit') || 50}
      >
        <option id="10">10</option>
        <option id="20">20</option>
        <option id="50">50</option>
        <option id="100">100</option>
      </select>
    </label>
  )
}
