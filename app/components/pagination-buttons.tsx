import type { Pagination } from '~/hooks/use-pagination'
import { useTranslations } from 'use-intl'
import { useSearchParams } from '@remix-run/react'

type Props = {
  total: number
} & Pagination

export function PaginationButtons({ total, ...pagination }: Props) {
  const t = useTranslations()
  const [params] = useSearchParams()
  const limit = parseInt(params.get('limit') as string) || 50
  const totalPages = Math.ceil(total / limit)
  return (
    <div className="flex justify-center gap-4">
      <button
        className="btn-outline btn-primary btn"
        disabled={!pagination.hasPrev}
        onClick={pagination.goToPrevPage}
      >
        {t('common.previous')}
      </button>
      <select
        className="input"
        onChange={(evt) => pagination.goToPage(evt.target.value)}
      >
        {Array.from({ length: totalPages }).map((_, id) => (
          <option key={id} id={id.toString()}>
            {t('common.page-n', { number: id + 1 })}
          </option>
        ))}
      </select>
      <button
        className="btn-outline btn-primary btn"
        disabled={!pagination.hasNext}
        onClick={pagination.goToNextPage}
      >
        {t('common.next')}
      </button>
    </div>
  )
}
