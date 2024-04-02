import type { Pagination } from '~/presentation/hooks/use-pagination'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from '@remix-run/react'
import { GrLinkPrevious, GrLinkNext } from 'react-icons/gr'
import { DEFAULT_DATA_LIMIT } from '~/constants'

type Props = {
  total: number
} & Pagination

export function PaginationButtons({ total, ...pagination }: Props) {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const limit = parseInt(params.get('limit') as string) || DEFAULT_DATA_LIMIT
  const offset = parseInt(params.get('offset') as string) || 0
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit)
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
        value={currentPage}
      >
        {Array.from({ length: totalPages }).map((_, id) => (
          <option key={id} value={id}>
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
