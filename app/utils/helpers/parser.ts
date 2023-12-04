import type { CategoryInputArray, TransactionExpenseInput } from '../types'

export const parseCategoryInput = (
  categoryInput: string,
): CategoryInputArray => {
  const categories = JSON.parse(categoryInput)
  if (!Array.isArray(categories)) {
    throw new Error('invalid category array')
  }
  categories.forEach(({ id, text }) => {
    if (typeof id !== 'string' && typeof text !== 'string') {
      throw new Error('invalid category array')
    }
  })
  return categories
}

const parseExpense = (expense: {
  title?: unknown
  unit?: unknown
  amount?: unknown
  categoryId?: unknown
  installments?: unknown
}) => {
  if (
    typeof expense.title !== 'string' ||
    typeof expense.categoryId !== 'string' ||
    typeof expense.amount !== 'number' ||
    (expense.unit && typeof expense.unit !== 'number') ||
    typeof expense.installments !== 'number'
  ) {
    return false
  }
  return {
    title: expense.title as string,
    amount: expense.amount,
    ...(!!expense.unit && { unit: expense.unit }),
    categoryId: expense.categoryId as string,
    installments: expense.installments,
  }
}

export const parseExpenses = (
  expensesJson: string,
): TransactionExpenseInput[] | false => {
  const parsedExpenses = JSON.parse(expensesJson)
  if (!Array.isArray(parsedExpenses)) {
    return false
  }
  let valid = true,
    i = 0
  const formattedExpenses = []
  while (i < parsedExpenses.length && valid) {
    const parsed = parseExpense(parsedExpenses[i])
    if (!parsed) {
      valid = false
    } else {
      formattedExpenses.push(parsed)
    }
    i++
  }
  // TODO prisma does not detect `unit` field is optional
  return !valid ? false : (formattedExpenses as TransactionExpenseInput[])
}
