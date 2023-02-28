import { Category } from '@prisma/client'
import { createContext, PropsWithChildren } from 'react'

export const CategoryContext = createContext({
  list: [] as Category[],
  map: new Map(),
})

type Props = {
  categories: Category[]
} & PropsWithChildren

// TODO this may be unused
export function CategoryProvider({ categories, children }: Props) {
  const map = new Map()
  categories.forEach(({ id, title }) => {
    map.set(id, title)
  })

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
