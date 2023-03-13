import type { ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from '@remix-run/react'

type Props = {
  url: string
  total: number
}

export type Pagination = {
  hasNext: boolean
  hasPrev: boolean
  onChangeLimit: (evt: ChangeEvent<HTMLSelectElement>) => void
  goToNextPage: () => void
  goToPrevPage: () => void
  goToPage: (pageNo: string) => void
}

export function usePagination({ url, total }: Props): Pagination {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const offset = parseInt(searchParams.get('offset') as string) || 0
  const limit = parseInt(searchParams.get('limit') as string) || 50
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit)
  const hasPrev = currentPage > 0
  const hasNext = currentPage < totalPages - 1

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

  return {
    hasNext,
    hasPrev,
    onChangeLimit,
    goToNextPage,
    goToPrevPage,
    goToPage,
  }
}
