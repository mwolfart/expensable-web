import { CategoriesOnExpense, Expense } from '@prisma/client'

export type ExpenseWithCategory = Expense & {
  categories: CategoriesOnExpense[]
}

export type CategoryInputArray = Array<{ id: string; text: string }>

export type AddExpenseFormErrors = {
  name?: string
  amount?: string
  unit?: string
  date?: string
  categories?: string
}
