import { CategoriesOnExpense, Expense } from '@prisma/client'

export type ExpenseWithCategory = Expense & {
  categories: CategoriesOnExpense[]
}
