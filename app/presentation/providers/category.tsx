import type { Category } from '@prisma/client'
import type { PropsWithChildren } from 'react'
import type { FetcherResponse } from '~/utils/types'
import { useFetcher } from '@remix-run/react'
import { useEffect, useMemo, useState, createContext } from 'react'

export const CategoryContext = createContext({
  list: [] as Category[],
  map: new Map(),
})

type CategoryFetcher = FetcherResponse & {
  categories: unknown
}

export function CategoryProvider({ children }: PropsWithChildren) {
  const fetcher = useFetcher<CategoryFetcher>()
  const [categories, setCategories] = useState<Category[]>([])
  const map = useMemo(() => new Map<string, string>(), [])

  useEffect(() => {
    if (fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load('/categories')
    }
  }, [fetcher])

  useEffect(() => {
    if (fetcher.data?.categories) {
      const fetchedCategories = fetcher.data.categories as Category[]
      setCategories(fetchedCategories)
      map.clear()
      fetchedCategories.forEach(({ id, title }) => {
        map.set(id, title)
      })
    }
  }, [fetcher.data, map])

  const initialContext = {
    list: categories,
    map,
  }

  return (
    <CategoryContext.Provider value={initialContext}>
      {children}
    </CategoryContext.Provider>
  )
}
