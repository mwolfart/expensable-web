import type { Category } from '@prisma/client'
import { CategoryItem } from './category-item'

type Props = {
  categories: Array<Category>
  query: string
}

export function CategoryList({ query, categories }: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {categories.map((category) => {
        if (category.title.toLowerCase().includes(query.toLowerCase())) {
          return <CategoryItem key={category.id} category={category} />
        }
        return null
      })}
    </div>
  )
}
