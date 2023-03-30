import type { Category } from '@prisma/client'
import type { PropsWithChildren } from 'react'
import { useFetcher } from '@remix-run/react'
import { useEffect, useMemo, useState } from 'react'
import { createContext } from 'react'

export const CategoryContext = createContext({
  list: [] as Category[],
  map: new Map(),
})

export function CategoryProvider({ children }: PropsWithChildren) {
  const fetcher = useFetcher()
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
