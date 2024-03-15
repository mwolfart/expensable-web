import type { Prisma } from '@prisma/client'
import { prisma } from '~/infra/db.server'
import {
  getIntervalForMonthYear,
  getMonthName,
  getUpcomingMonthYears,
} from '~/utils/helpers'
import type {
  CategoryInputArray,
  ExpenseCreate,
  ExpenseFilters,
  ExpenseUpdate,
} from '~/utils/types'
import { getCategoryById } from './category.server'
import { DEFAULT_DATA_LIMIT } from '~/constants'

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
  const startDate = new Date(Date.UTC(year, month))
  const endDate = new Date(Date.UTC(year, month + 1, 0))
  return getUserExpensesByFilter(userId, { startDate, endDate })
}

export const getUserExpensesByYear = (userId: string, year: number) => {
  const startDate = new Date(Date.UTC(year))
  const endDate = new Date(Date.UTC(year + 1, 0, 0))
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
  const startDate = new Date(Date.UTC(year, month))
  const endDate = new Date(Date.UTC(year, month + 1, 0))
  const where = getWhereClauseFromFilter(userId, { startDate, endDate })
  return prisma.expense.aggregate({
    where,
    _sum: {
      amountEffective: true,
    },
  })
}

const buildMonthYearExpenseCorrelation = (
  totalAmount: number,
  { month, year }: { month: number; year: number },
) => {
  const period = new Date()
  period.setMonth(month)
  period.setFullYear(year)
  return {
    period: `${getMonthName(period.getMonth())} ${period.getFullYear()}`,
    total: totalAmount ? parseFloat(totalAmount.toFixed(2)) : 0,
  }
}

export const getUserExpensesInNumOfMonths = async (
  userId: string,
  startDate: Date,
  amountOfMonths?: number,
) => {
  const upcomingMonthYears = getUpcomingMonthYears(startDate, amountOfMonths)
  const totalsPerMonthYearPromises = upcomingMonthYears.map((monthYear) =>
    getUserExpenseTotalByMonthYear(userId, monthYear.month, monthYear.year),
  )
  const totalsPerMonthRaw = await Promise.all(totalsPerMonthYearPromises)
  const totalsPerMonth = totalsPerMonthRaw.map(({ _sum }, i) => {
    return buildMonthYearExpenseCorrelation(
      _sum.amountEffective || 0,
      upcomingMonthYears[i],
    )
  })

  return totalsPerMonth
}

const getPipelineMatchingCategoriesAndExpenses = (
  userId: string,
  startDate: Date,
  endDate: Date,
  limit?: number,
) => {
  const pipeline: Prisma.InputJsonValue[] = [
    {
      $lookup: {
        from: 'Expense',
        localField: 'expenseId',
        foreignField: '_id',
        as: 'expenseDetails',
      },
    },
    {
      $unwind: '$expenseDetails',
    },
    {
      $match: {
        $and: [
          {
            $expr: {
              $gte: [
                '$expenseDetails.datetime',
                {
                  $dateFromString: {
                    dateString: startDate.toISOString(),
                  },
                },
              ],
            },
          },
          {
            $expr: {
              $lte: [
                '$expenseDetails.datetime',
                {
                  $dateFromString: {
                    dateString: endDate.toISOString(),
                  },
                },
              ],
            },
          },
          {
            'expenseDetails.userId': { $oid: userId },
          },
        ],
      },
    },
    {
      $sort: {
        totalAmount: -1,
      },
    },
  ]
  if (limit !== -1) {
    pipeline.splice(4, 0, {
      $limit: limit || 6,
    })
  }
  return pipeline
}

const getUserExpensesPerCategoriesInInterval = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  limit?: number,
) => {
  const groupBy = {
    $group: {
      _id: '$categoryId',
      totalAmount: {
        $sum: '$expenseDetails.amountEffective',
      },
    },
  }
  const pipeline = getPipelineMatchingCategoriesAndExpenses(
    userId,
    startDate,
    endDate,
    limit,
  )
  pipeline.splice(3, 0, groupBy)
  const query = await prisma.categoriesOnExpense.aggregateRaw({
    pipeline,
  })
  return query
}

const getUserInstallmentsPerCategoriesInInterval = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  limit?: number,
) => {
  const groupBy = {
    $group: {
      _id: '$categoryId',
      totalAmount: {
        $sum: 1,
      },
    },
  }
  const filter = {
    $match: {
      $and: [
        {
          'expenseDetails.isVisible': true,
        },
        {
          'expenseDetails.installments': {
            $gt: 1,
          },
        },
      ],
    },
  }
  const pipeline = getPipelineMatchingCategoriesAndExpenses(
    userId,
    startDate,
    endDate,
    limit,
  )
  pipeline.splice(3, 0, filter, groupBy)
  const query = await prisma.categoriesOnExpense.aggregateRaw({
    pipeline,
  })
  return query
}

const getTotalPerCategoryCorrelationFromQueryResult = async (
  query: Array<{ _id: { $oid: string }; totalAmount: number }>,
) => {
  const correlationPromises = query
    .filter((item) =>
      Boolean(
        item._id && item._id.$oid && typeof item.totalAmount !== 'undefined',
      ),
    )
    .map(async ({ _id: { $oid: categoryId }, totalAmount }) => {
      const category = await getCategoryById(categoryId)
      return {
        categoryName: category?.title || '',
        total: totalAmount as number,
      }
    })

  const correlations = await Promise.all(correlationPromises)
  return correlations
}

export const getUserTotalsPerCategoryInMonthYear = async (
  month: number,
  year: number,
  userId: string,
  limit?: number,
) => {
  const { startDate, endDate } = getIntervalForMonthYear(month, year)
  startDate.setUTCHours(0, 0, 0, 0)
  endDate.setUTCHours(0, 0, 0, 0)
  const query = await getUserExpensesPerCategoriesInInterval(
    userId,
    startDate,
    endDate,
    limit,
  )
  if (query && Array.isArray(query)) {
    return await getTotalPerCategoryCorrelationFromQueryResult(query)
  }
  return []
}

export const getUserInstallmentsPerCategoryInMonthYear = async (
  month: number,
  year: number,
  userId: string,
  limit?: number,
) => {
  const { startDate, endDate } = getIntervalForMonthYear(month, year)
  const query = await getUserInstallmentsPerCategoriesInInterval(
    userId,
    startDate,
    endDate,
    limit,
  )
  if (query && Array.isArray(query)) {
    return await getTotalPerCategoryCorrelationFromQueryResult(query)
  }
  return []
}

const createInstallmentExpenses = async (
  parentExpense: ExpenseUpdate,
  categories?: CategoryInputArray,
) => {
  const { id, installments, datetime, amount, ...payload } = parentExpense
  const installmentExpensesRes = [...Array(installments - 1).keys()].map(
    async (i) => {
      const installmentDate = new Date(datetime)
      installmentDate.setUTCMonth(datetime.getUTCMonth() + i + 1, 1)
      installmentDate.setUTCHours(0, 0, 0)
      const expenseRes = await prisma.expense.create({
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

      // Mirror categories
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
    await createInstallmentExpenses(expenseRes, categories)
  }

  return expenseRes
}

export const updateExpense = async (
  expense: ExpenseUpdate,
  categories?: CategoryInputArray,
) => {
  const { id, amount, installments, ...payload } = expense

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
  await prisma.expense.deleteMany({
    where: {
      parentExpenseId: expense.id,
    },
  })
  await createInstallmentExpenses(expenseRes, categories)

  return expenseRes
}

export const deleteExpense = async (id: string) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
  })
  if (!expense) {
    return
  }
  if (expense.installments > 0) {
    await prisma.expense.deleteMany({
      where: {
        parentExpenseId: id,
      },
    })
  }
  return prisma.expense.delete({ where: { id } })
}
