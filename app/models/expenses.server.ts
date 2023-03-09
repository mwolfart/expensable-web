import type { Expense } from '@prisma/client'
import { prisma } from '~/db.server'
import type { CategoryInputArray, ExpenseFilters } from '~/utils/types'

export const getUserExpenses = (id: string) =>
  prisma.expense.findMany({
    include: {
      categories: true,
    },
    where: {
      userId: id,
    },
  })

export const getUserExpensesByFilter = (
  userId: string,
  { title, startDate, endDate, categoriesIds }: ExpenseFilters,
) => {
  const datetime = {
    ...(startDate && { lte: startDate }),
    ...(endDate && { gte: endDate }),
  }
  const categories = {
    some: {
      OR: categoriesIds?.map((catId) => ({ categoryId: catId })),
    },
  }
  const where = {
    userId,
    ...(title && { title }),
    ...((startDate || endDate) && { datetime }),
    ...(categoriesIds && { categories }),
  }
  return prisma.expense.findMany({
    where,
    include: {
      categories: true,
    },
  })
}

export const getUserExpensesByQuery = (userId: string, text: string) =>
  getUserExpensesByFilter(userId, { title: text })

export const getUserExpensesByCategories = (
  userId: string,
  categoriesIds: string[],
) => getUserExpensesByFilter(userId, { categoriesIds })

export const getUserExpensesByDateInterval = (
  userId: string,
  startDate: Date,
  endDate: Date,
) => getUserExpensesByFilter(userId, { startDate, endDate })

export const getUserExpensesByMonthYear = (
  userId: string,
  month: number,
  year: number,
) => {
  if (month > 11) {
    throw new Error('Month must be less than 11')
  }
  const startDate = new Date(year, month)
  const endDate = new Date(year, month + 1, 0)
  return getUserExpensesByFilter(userId, { startDate, endDate })
}

export const getUserExpensesByYear = (userId: string, year: number) => {
  const startDate = new Date(year)
  const endDate = new Date(year + 1, 0, 0)
  return getUserExpensesByFilter(userId, { startDate, endDate })
}

export const createExpense = async (
  expense: Pick<Expense, 'title' | 'amount' | 'unit' | 'userId' | 'datetime'>,
  categories?: CategoryInputArray,
) => {
  const expenseRes = await prisma.expense.create({
    data: expense,
  })
  const categoriesRes = categories?.map(({ id }) =>
    prisma.categoriesOnExpense.create({
      data: {
        expenseId: expenseRes.id,
        categoryId: id,
      },
    }),
  )
  if (categoriesRes) {
    await Promise.all(categoriesRes)
  }
  return expenseRes
}

export const updateExpense = async (
  expense: Expense,
  categories?: CategoryInputArray,
) => {
  const { id, ...payload } = expense
  const originalCategories = await prisma.categoriesOnExpense.findMany({
    where: {
      expenseId: id,
    },
  })
  const removedCategories = originalCategories.filter(
    (before) => !categories?.find((after) => after.id == before.categoryId),
  )
  const expenseRes = await prisma.expense.update({
    where: {
      id: expense.id,
    },
    data: payload,
  })
  const removedCatRes = removedCategories.map(({ id }) =>
    prisma.categoriesOnExpense.delete({ where: { id } }),
  )
  const addedCatRes = categories?.map(({ id }) =>
    prisma.categoriesOnExpense.upsert({
      where: {
        expenseId_categoryId: {
          expenseId: expense.id,
          categoryId: id,
        },
      },
      create: {
        expenseId: expense.id,
        categoryId: id,
      },
      update: {
        expenseId: expense.id,
        categoryId: id,
      },
    }),
  )
  if (addedCatRes) {
    await Promise.all(addedCatRes)
  }
  if (removedCatRes) {
    await Promise.all(removedCatRes)
  }
  return expenseRes
}

export const deleteExpense = (id: string) =>
  prisma.expense.delete({ where: { id } })
