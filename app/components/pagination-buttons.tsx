import type { Pagination } from '~/hooks/use-pagination'
import { useTranslations } from 'use-intl'
import { useSearchParams } from '@remix-run/react'
import { GrLinkPrevious, GrLinkNext } from 'react-icons/gr'
import { DEFAULT_DATA_LIMIT } from '~/utils'

type Props = {
  total: number
} & Pagination

export function PaginationButtons({ total, ...pagination }: Props) {
  const t = useTranslations()
  const [params] = useSearchParams()
  const limit = parseInt(params.get('limit') as string) || DEFAULT_DATA_LIMIT
  const totalPages = Math.ceil(total / limit)
  return (
    <div className="flex justify-center gap-4">
      <button
        className="btn-outline btn-primary btn"
        disabled={!pagination.hasPrev}
        onClick={pagination.goToPrevPage}
        aria-label={t('common.previous')}
      >
        <div className="hidden sm:block">{t('common.previous')}</div>
        <div className="block sm:hidden">
          <GrLinkPrevious size={16} />
        </div>
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
        aria-label={t('common.next')}
      >
        <div className="hidden sm:block">{t('common.next')}</div>
        <div className="block sm:hidden">
          <GrLinkNext size={16} />
        </div>
      </button>
    </div>
  )
}
