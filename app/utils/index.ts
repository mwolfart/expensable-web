import type { CategoryInputArray, TransactionExpenseInput } from './types'
import type { KeyboardEvent } from 'react'
import cx from 'classnames'

export const cxWithFade = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition`,
    !active && 'pointer-events-none opacity-0',
    active && 'opacity-100',
  )
}

export const cxWithGrowFadeMd = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition-height-fade duration-300`,
    !active && 'max-h-0 opacity-0 invisible',
    active && 'max-h-64 opacity-1 visible',
  )
}

export const cxWithGrowMd = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition-height duration-700`,
    !active && 'max-h-0 delay-200',
    active && 'max-h-64 delay-0',
  )
}

export const cxWithGrowFadeLg = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition-height-fade duration-700`,
    !active && 'max-h-0 opacity-0 invisible',
    active && 'max-h-96 opacity-1 visible',
  )
}

export const cxWithDelayedFade = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition duration-500`,
    !active && 'pointer-events-none opacity-0 delay-0',
    active && 'opacity-100 delay-200',
  )
}

export const cxFormInput = ({
  hasError,
  extraClasses,
}: {
  hasError?: unknown
  extraClasses?: string
}) => {
  return cx(
    'input w-full bg-white',
    Boolean(hasError) && 'border-error placeholder-error',
    extraClasses,
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getYupErrors = (yupError: any) => {
  const errorArray = yupError.inner.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ path, errors: [code] }: any): { path: string; code: string } => ({
      path,
      code,
    }),
  ) as Array<{ path: string; code: string }>
  const errors = errorArray
    .reverse()
    .reduce((acc, { path, code }) => ({ ...acc, [path]: code }), {})
  return errors
}

export const onEnter = (
  evt: KeyboardEvent<HTMLInputElement>,
  callback: () => unknown,
) => {
  if (evt.key === 'Enter') {
    callback()
  }
}

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

export const formatCurrency = (amount: number) => {
  const currency = 'R$'
  return `${currency} ${amount.toFixed(2)}`
}

export const formatDate = (date: Date) =>
  date.toISOString().substring(0, 10).split('-').reverse().join('/')

export const getMonthName = (month: number) => {
  switch (month) {
    case 0:
      return 'January'
    case 1:
      return 'February'
    case 2:
      return 'March'
    case 3:
      return 'April'
    case 4:
      return 'May'
    case 5:
      return 'June'
    case 6:
      return 'July'
    case 7:
      return 'August'
    case 8:
      return 'September'
    case 9:
      return 'October'
    case 10:
      return 'November'
    case 11:
      return 'December'
  }
}

export const trimStr = (longStr: string) =>
  longStr.length > 10 ? `${longStr.substring(0, 8)}...` : longStr

export const areAllValuesEmpty = (filter: { [key: string]: unknown }) =>
  Object.values(filter).every((v) => !v)

export const DEFAULT_DATA_LIMIT = 50
