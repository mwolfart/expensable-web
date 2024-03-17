import type {
  CategoriesOnExpense,
  Category,
  Expense,
  ExpensesInTransaction,
  FixedExpense,
  Transaction,
} from '@prisma/client'

export type ExpenseUpdate = Omit<
  Expense,
  'isVisible' | 'parentExpenseId' | 'amountEffective'
>

export type ExpenseCreate = Omit<
  Expense,
  'id' | 'isVisible' | 'parentExpenseId' | 'amountEffective'
>

export type ExpenseWithCategory = Expense & {
  categories: CategoriesOnExpense[]
}

export type TransactionWithExpenses = Transaction & {
  expenses: ExpensesInTransaction[]
}

export type CategoryInputArray = Array<{ id: string; text: string }>

export type TransactionExpenseInput = Pick<
  Expense,
  'title' | 'unit' | 'amount' | 'installments'
> & {
  categoryId: string
}

export type AddExpenseFormErrors = {
  name?: string
  amount?: string
  unit?: string
  date?: string
  categories?: string
  installments?: string
  message?: string
}

export type ExpenseFilters = {
  title?: string | null
  startDate?: Date | null
  endDate?: Date | null
  categoriesIds?: string[] | null
}

export type AddTransactionFormErrors = {
  title?: string
  date?: string
  expenses?: string
  message?: string
  categories?: string
}

export type TransactionFilters = {
  startDate?: Date | null
  endDate?: Date | null
}

export type FetcherResponse = {
  success?: boolean
  method?: string
  error?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any
}

export type FixedExpenseUpdate = Omit<
  FixedExpense,
  'isParent' | 'parentExpenseId' | 'amount'
> & {
  varyingCosts: boolean
  amountPerMonth: number[]
  amount: number
  parentExpenseId?: string
}

export type FixedExpenseCreate = Omit<FixedExpenseUpdate, 'id'>

export type FixedExpenseWithDetails = Omit<FixedExpense, 'categoryId'> & {
  category: Category | null
  childExpenses: FixedExpense[]
}
