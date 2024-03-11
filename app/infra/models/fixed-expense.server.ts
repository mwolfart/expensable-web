import type { FixedExpenseCreate, FixedExpenseUpdate } from '~/utils/types'
import { prisma } from '~/infra/db.server'
import { DEFAULT_DATA_LIMIT } from '~/constants'

export const getUserFixedExpenses = (
  id: string,
  offset?: number,
  limit?: number,
) =>
  prisma.fixedExpense.findMany({
    include: {
      category: true,
      childExpenses: {
        where: {
          date: {
            gte: new Date(),
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

// TODO: Prisma does not currently support counting along with fetching. Change this in the future to use only one query
export const countUserFixedExpenses = (id: string) =>
  prisma.fixedExpense.count({
    where: {
      userId: id,
      isParent: true,
    },
  })

export const createFixedExpense = async (
  expense: FixedExpenseCreate,
  isChild?: boolean,
) => {
  const { varyingCosts, amount, amountPerMonth, amountOfMonths, date } = expense
  const dateObject = new Date(date)

  // Root expense
  const expenseRes = await prisma.fixedExpense.create({
    data: {
      ...expense,
      date: dateObject,
      isParent: isChild || true,
      amount: varyingCosts ? amountPerMonth[0] : amount,
    },
  })

  // Children
  if (!isChild) {
    for (let i = 0; i < amountOfMonths; i++) {
      dateObject.setMonth(dateObject.getMonth() + 1, 1)
      dateObject.setHours(0, 0, 0)
      await createFixedExpense(
        {
          ...expense,
          date: new Date(dateObject),
          amountPerMonth: amountPerMonth.slice(1),
          parentExpenseId: expenseRes.id,
        },
        true,
      )
    }
  }
  return expenseRes
}

export const updateFixedExpense = async (expense: FixedExpenseUpdate) => {
  const { id, varyingCosts, amount, amountPerMonth, amountOfMonths, date } =
    expense
  const dateObject = new Date(date)

  // Root expense
  const expenseRes = await prisma.fixedExpense.update({
    where: {
      id,
    },
    data: {
      ...expense,
      date: dateObject,
      isParent: true,
      amount: varyingCosts ? amountPerMonth[0] : amount,
    },
  })

  // Children
  await prisma.fixedExpense.deleteMany({
    where: {
      parentExpenseId: id,
    },
  })

  for (let i = 0; i < amountOfMonths; i++) {
    dateObject.setMonth(dateObject.getMonth() + 1, 1)
    dateObject.setHours(0, 0, 0)
    await createFixedExpense(
      {
        ...expense,
        date: new Date(dateObject),
        amountPerMonth: amountPerMonth.slice(1),
        parentExpenseId: expenseRes.id,
      },
      true,
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
