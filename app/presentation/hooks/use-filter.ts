import { useNavigate, useSearchParams } from '@remix-run/react'
import { useState } from 'react'

type Props = {
  url: string
}

export function useFilter({ url }: Props) {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [params] = useSearchParams()
  const limit = params.get('limit')

  const isFilterApplied =
    Array.from(params.keys()).filter((k) => k !== 'offset' && k !== 'limit')
      .length > 0

  const onApplyFilters = (formData: FormData) => {
    const queries = [...formData.entries()]
    const fullQuery = queries
      .filter(([_, value]) => Boolean(value))
      .map(([field, value]) => `${field}=${value}`)
      .join('&')
    setShowFilters(false)
    navigate(`${url}?${fullQuery}&limit=${limit}`)
  }

  const onClearFilters = () => {
    setShowFilters(false)
    navigate(url)
  }

  return {
    showFilters,
    isFilterApplied,
    onApplyFilters,
    onClearFilters,
  }
}
