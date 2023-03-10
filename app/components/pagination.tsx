import { useNavigate } from '@remix-run/react'
import { ChangeEvent, ReactNode, useState } from 'react'
import { useTranslations } from 'use-intl'
import cx from 'classnames'
import { areAllValuesEmpty } from '~/utils'

type Props = {
  url: string
  total: number
  searchParams: URLSearchParams
  FilterComponent: ReactNode
}

export function Pagination({
  url,
  total,
  searchParams,
  FilterComponent,
}: Props) {
  const t = useTranslations()
  const navigate = useNavigate()

  const [showFilters, setShowFilters] = useState(false)

  //   const filterApplied =
  //     Array.from(searchParams.keys()).filter(
  //       (k) => k !== 'offset' && k !== 'limit',
  //     ).length > 0

  const offset = parseInt(searchParams.get('offset') as string) || 0
  const limit = parseInt(searchParams.get('limit') as string) || 50
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit)
  const hasPrev = currentPage > 0
  const hasNext = currentPage < totalPages - 1

  //   const onApplyFilters = (formData: FormData) => {
  //     const queries = [...formData.entries()]
  //     const fullQuery = queries
  //       .filter(([_, value]) => Boolean(value))
  //       .map(([field, value]) => `${field}=${value}`)
  //       .join('&')
  //     setShowFilters(false)
  //     navigate(`${url}?${fullQuery}&limit=${limit}`)
  //   }

  //   const onClearFilters = () => {
  //     setShowFilters(false)
  //     navigate(url)
  //   }

  const onChangeLimit = (evt: ChangeEvent<HTMLSelectElement>) => {
    searchParams.set('limit', evt.target.value)
    navigate(`${url}?${searchParams}`)
  }

  const goToPrevPage = () => {
    searchParams.set('offset', ((currentPage - 1) * limit).toString())
    navigate(`${url}?${searchParams}`)
  }

  const goToNextPage = () => {
    searchParams.set('offset', ((currentPage + 1) * limit).toString())
    navigate(`${url}?${searchParams}`)
  }

  const goToPage = (pageNo: string) => {
    searchParams.set('offset', (parseInt(pageNo) * limit).toString())
    navigate(`${url}?${searchParams}`)
  }

  const cxFilterButton = cx(
    'btn-primary btn transition',
    !filterApplied && 'btn-outline',
  )

  const MobileFiltersDialog = (
    <div className="fixed inset-0 flex flex-col justify-center gap-4 bg-foreground p-16 sm:px-24 md:hidden">
      {FilterComponent}
      <button
        className="btn-outline btn-primary btn"
        onClick={() => setShowFilters(false)}
      >
        {t('common.cancel')}
      </button>
    </div>
  )

  return (
    <div className="m-8 mt-0 flex flex-grow flex-col gap-2 md:mt-4 md:gap-4">
      {showFilters && MobileFiltersDialog}
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-4">
          <button
            className={cxFilterButton}
            aria-label={t('common.filters')}
            onClick={() => setShowFilters(!showFilters)}
          >
            <BiFilterAlt size={24} />
          </button>
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
        </div>
        <button className="btn-primary btn" onClick={onAddExpense}>
          <div className="hidden sm:block">{t('expenses.add')}</div>
          <AiOutlinePlus className="block text-white sm:hidden" size={24} />
        </button>
      </div>
      <div className={cxWithGrowFadeLg('hidden md:block', showFilters)}>
        {FiltersBlock}
      </div>
      {!expenses.length && (
        <NoData>
          <p>{t('expenses.try-adding')}</p>
        </NoData>
      )}
      {!!expenses.length && (
        <>
          <ExpenseList
            expenses={expenses}
            renderDeleteToast={onExpenseDeleted}
            renderEditDialog={onEditExpense}
            categoryMap={categoryMap}
          />
          <div className="flex justify-center gap-4">
            <button
              className="btn-outline btn-primary btn"
              disabled={!hasPrev}
              onClick={goToPrevPage}
            >
              {t('common.previous')}
            </button>
            <select
              className="input"
              onChange={(evt) => goToPage(evt.target.value)}
            >
              {Array.from({ length: totalPages }, (_, id) => (
                <option key={id} id={id.toString()}>
                  {t('common.page-n', { number: id + 1 })}
                </option>
              ))}
            </select>
            <button
              className="btn-outline btn-primary btn"
              disabled={!hasNext}
              onClick={goToNextPage}
            >
              {t('common.next')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
