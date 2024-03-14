import type { FixedExpenseCreate, FixedExpenseUpdate } from '~/utils/types'
import { prisma } from '~/infra/db.server'
import { DEFAULT_DATA_LIMIT } from '~/constants'

export const getUserFixedExpenses = (
  id: string,
  offset?: number,
  limit?: number,
) => {
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)
  return prisma.fixedExpense.findMany({
    include: {
      category: true,
      childExpenses: {
        where: {
          date: {
            gte: currentMonth,
          },
        },
        orderBy: {
          date: 'asc',
        },
        take: 6,
      },
    },
    where: {
      userId: id,
      isParent: true,
    },
    skip: offset || 0,
    take: limit || DEFAULT_DATA_LIMIT,
    orderBy: {
      date: 'asc',
    },
  })
}

// TODO: Prisma does not currently support counting along with fetching. Change this in the future to use only one query
export const countUserFixedExpenses = (id: string) =>
  prisma.fixedExpense.count({
    where: {
      userId: id,
      isParent: true,
    },
  })

export const getUserFixedExpenseById = (userId: string, expenseId: string) =>
  prisma.fixedExpense.findUnique({
    include: {
      category: true,
      childExpenses: {
        orderBy: {
          date: 'asc',
        },
      },
    },
    where: {
      userId,
      id: expenseId,
    },
  })

export const createFixedExpense = async (
  expense: FixedExpenseCreate,
  isParent?: boolean,
) => {
  const {
    varyingCosts,
    amount,
    amountPerMonth,
    amountOfMonths,
    date,
    ...rest
  } = expense
  const dateObject = new Date(date)

  const expenseRes = await prisma.fixedExpense.create({
    data: {
      ...rest,
      amountOfMonths,
      date: dateObject,
      isParent: typeof isParent === 'undefined' ? true : isParent,
      amount: varyingCosts ? amountPerMonth[0] : amount,
      varyingCosts,
    },
  })

  if (typeof isParent === 'undefined' || isParent) {
    for (let i = 0; i < amountOfMonths - 1; i++) {
      dateObject.setMonth(dateObject.getMonth() + 1, 1)
      dateObject.setHours(0, 0, 0)
      await createFixedExpense(
        {
          ...expense,
          date: new Date(dateObject),
          amountPerMonth: amountPerMonth?.slice(i + 1),
          parentExpenseId: expenseRes.id,
        },
        false,
      )
    }
  }
  return expenseRes
}

export const updateFixedExpense = async (expense: FixedExpenseUpdate) => {
  const {
    id,
    varyingCosts,
    amount,
    amountPerMonth,
    amountOfMonths,
    date,
    ...rest
  } = expense
  const dateObject = new Date(date)

  const expenseRes = await prisma.fixedExpense.update({
    where: {
      id,
    },
    data: {
      ...rest,
      amountOfMonths,
      date: dateObject,
      isParent: true,
      amount: varyingCosts ? amountPerMonth[0] : amount,
    },
  })

  await prisma.fixedExpense.deleteMany({
    where: {
      parentExpenseId: id,
    },
  })

  for (let i = 0; i < amountOfMonths - 1; i++) {
    dateObject.setMonth(dateObject.getMonth() + 1, 1)
    dateObject.setHours(0, 0, 0)
    await createFixedExpense(
      {
        ...rest,
        amount,
        amountOfMonths,
        varyingCosts,
        date: new Date(dateObject),
        amountPerMonth: amountPerMonth?.slice(i + 1),
        parentExpenseId: expenseRes.id,
      },
      false,
    )
  }
  return expenseRes
}

export const deleteFixedExpense = async (id: string) => {
  await prisma.fixedExpense.deleteMany({
    where: {
      parentExpenseId: id,
    },
  })

  const expenseRes = await prisma.fixedExpense.delete({
    where: {
      id,
    },
  })

  return expenseRes
}
