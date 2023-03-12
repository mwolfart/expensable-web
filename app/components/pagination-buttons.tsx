import type { Pagination } from '~/hooks/use-pagination'
import { useTranslations } from 'use-intl'

type Props = {
  total: number
} & Pagination

export function PaginationButtons({ total, ...pagination }: Props) {
  const t = useTranslations()
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
        {Array.from({ length: total }, (_, id) => (
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
