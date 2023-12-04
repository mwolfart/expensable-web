import type { Category } from '@prisma/client'
import { CategoryItem } from './category-item'

type Props = {
  categories: Array<Category>
  renderDeleteToast: () => void
  query: string
}

export function CategoryList({ query, categories, renderDeleteToast }: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {categories.map((category) => {
        if (category.title.toLowerCase().includes(query.toLowerCase())) {
          return (
            <CategoryItem
              key={category.id}
              category={category}
              renderDeleteToast={renderDeleteToast}
            />
          )
        }
        return null
      })}
    </div>
  )
}
