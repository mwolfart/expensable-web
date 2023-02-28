import type { Expense } from '@prisma/client'
import { prisma } from '~/db.server'
import type { CategoryInputArray } from '~/utils/types'

export const getUserExpenses = (id: string) =>
  prisma.user.findUnique({
    select: {
      expenses: {
        include: {
          categories: true,
        },
      },
    },
    where: {
      id,
    },
  })

type Filters = {
  title?: string
  startDate?: Date
  endDate?: Date
  categoryId?: string
}

export const getUserExpensesByFilter = (
  userId: string,
  { title, startDate, endDate, categoryId }: Filters,
) => {
  const datetime = {
    ...(startDate && { lte: startDate }),
    ...(endDate && { gte: endDate }),
  }
  const categories = {
    some: {
      id: categoryId,
    },
  }
  const where = {
    userId,
    ...(title && { title }),
    ...(startDate || (endDate && { datetime })),
    ...(categoryId && { categories }),
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

export const getUserExpensesByCategory = (userId: string, categoryId: string) =>
  getUserExpensesByFilter(userId, { categoryId })

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
  const expenseRes = await prisma.expense.update({
    where: {
      id: expense.id,
    },
    data: expense,
  })
  const categoriesRes = categories?.map(({ id }) =>
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
  if (categoriesRes) {
    await Promise.all(categoriesRes)
  }
  return expenseRes
}

export const deleteExpense = (id: string) =>
  prisma.expense.delete({ where: { id } })
