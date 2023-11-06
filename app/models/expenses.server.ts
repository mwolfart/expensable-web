import { prisma } from '~/db.server'
import { DEFAULT_DATA_LIMIT } from '~/utils'
import type {
  CategoryInputArray,
  ExpenseCreate,
  ExpenseFilters,
  ExpenseUpdate,
} from '~/utils/types'

export const getUserExpenses = (id: string, offset?: number, limit?: number) =>
  prisma.expense.findMany({
    include: {
      categories: true,
    },
    where: {
      userId: id,
      isVisible: true,
    },
    skip: offset || 0,
    take: limit || DEFAULT_DATA_LIMIT,
    orderBy: {
      datetime: 'asc',
    },
  })

export const getUserExpensesByIds = (
  userId: string,
  expenseIds: string[],
  offset?: number,
  limit?: number,
) =>
  prisma.expense.findMany({
    include: {
      categories: true,
    },
    where: {
      userId: userId,
      id: { in: expenseIds },
    },
    skip: offset || 0,
    take: limit || DEFAULT_DATA_LIMIT,
    orderBy: {
      datetime: 'asc',
    },
  })

// TODO: Prisma does not currently support counting along with fetching. Change this in the future to use only one query
export const countUserExpenses = (id: string) =>
  prisma.expense.count({
    where: {
      userId: id,
      isVisible: true,
    },
  })

export const countUserExpensesByIds = (userId: string, expenseIds: string[]) =>
  prisma.expense.count({
    where: {
      userId: userId,
      id: { in: expenseIds },
    },
  })

const getWhereClauseFromFilter = (
  userId: string,
  { title, startDate, endDate, categoriesIds }: ExpenseFilters,
) => {
  const datetime = {
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: endDate }),
  }
  const categories = {
    some: {
      OR: categoriesIds?.map((catId) => ({ categoryId: catId })),
    },
  }

  const where = {
    userId,
    ...(title && { title: { contains: title } }),
    ...((startDate || endDate) && { datetime }),
    ...(categoriesIds && { categories }),
  }
  return where
}

export const getUserExpensesByFilter = (
  userId: string,
  filters: ExpenseFilters,
  offset?: number,
  limit?: number,
) => {
  const where = {
    ...getWhereClauseFromFilter(userId, filters),
    isVisible: true,
  }
  return prisma.expense.findMany({
    where,
    include: {
      categories: true,
    },
    skip: offset || 0,
    take: limit || DEFAULT_DATA_LIMIT,
    orderBy: {
      datetime: 'asc',
    },
  })
}

// TODO: Prisma does not currently support counting along with fetching. Change this in the future to use only one query
export const countUserExpensesByFilter = (
  userId: string,
  filters: ExpenseFilters,
) => {
  const where = {
    ...getWhereClauseFromFilter(userId, filters),
    isVisible: true,
  }
  return prisma.expense.count({
    where,
    orderBy: {
      datetime: 'asc',
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

export const getUserExpenseTotalByMonthYear = async (
  userId: string,
  month: number,
  year: number,
) => {
  if (month > 11) {
    throw new Error('Month must be less than 11')
  }
  const startDate = new Date(year, month)
  const endDate = new Date(year, month + 1, 0)
  const where = getWhereClauseFromFilter(userId, { startDate, endDate })
  return prisma.expense.aggregate({
    where,
    _sum: {
      amountEffective: true,
    },
  })
}

const createInstallmentExpenses = async (parentExpense: ExpenseUpdate) => {
  const { id, installments, datetime, amount, ...payload } = parentExpense
  const installmentExpensesRes = [...Array(installments - 1).keys()].map(
    (i) => {
      const installmentDate = new Date(
        new Date(datetime).setMonth(datetime.getMonth() + i + 1),
      )
      return prisma.expense.create({
        data: {
          ...payload,
          amount,
          installments,
          parentExpenseId: parentExpense.id,
          datetime: installmentDate,
          isVisible: false,
          amountEffective: amount / installments,
        },
      })
    },
  )
  return Promise.all(installmentExpensesRes)
}

export const createExpense = async (
  expense: ExpenseCreate,
  categories?: CategoryInputArray,
) => {
  const { amount, installments } = expense

  // Root expense
  const expenseRes = await prisma.expense.create({
    data: {
      ...expense,
      isVisible: true,
      amountEffective: amount / (installments || 1),
    },
  })

  // Category relations
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

  // Installment expenses
  if (installments > 1) {
    await createInstallmentExpenses(expenseRes)
  }

  return expenseRes
}

export const updateExpense = async (
  expense: ExpenseUpdate,
  categories?: CategoryInputArray,
) => {
  const { id, amount, installments, ...payload } = expense

  const oldInstallmentsRes = await prisma.expense.findUnique({
    where: {
      id: expense.id,
    },
    select: {
      installments: true,
    },
  })

  // Old category relationships
  const originalCategories = await prisma.categoriesOnExpense.findMany({
    where: {
      expenseId: id,
    },
  })
  const removedCategories = originalCategories.filter(
    (before) => !categories?.find((after) => after.id == before.categoryId),
  )

  // Main expense
  const expenseRes = await prisma.expense.update({
    where: {
      id: expense.id,
    },
    data: {
      ...payload,
      amount,
      installments,
      amountEffective: amount / (installments || 1),
    },
  })

  // Category relationships updates
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

  // Installment updates
  const oldInstallments = oldInstallmentsRes?.installments
  if (oldInstallments && oldInstallments !== installments) {
    await prisma.expense.deleteMany({
      where: {
        parentExpenseId: expense.id,
      },
    })
    await createInstallmentExpenses(expenseRes)
  }

  return expenseRes
}

export const deleteExpense = (id: string) =>
  prisma.expense.delete({ where: { id } })
