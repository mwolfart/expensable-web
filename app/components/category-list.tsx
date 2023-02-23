import { Category } from '@prisma/client'
import { CategoryItem } from './category-item'

type Props = {
  categories: Array<Category>
  renderDeleteToast: () => void
}

export function CategoryList({ categories, renderDeleteToast }: Props) {
  return (
    <div className="flex flex-col gap-[1px] bg-gradient-to-r from-grey to-primary">
      {categories.map((category) => (
        <div key={category.id}>
          <CategoryItem
            category={category}
            renderDeleteToast={renderDeleteToast}
          />
        </div>
      ))}
    </div>
  )
}
