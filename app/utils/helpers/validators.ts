import { parseCategoryInput } from './parser'

export const isFixedExpenseAmountPerMonthValid = (value?: string) => {
  if (typeof value !== 'string') {
    return false
  }
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return false
    }
    const item = parsed[0]
    return typeof item === 'number'
  } catch {
    return false
  }
}

export const isCategoryListValid = (value?: string) => {
  if (typeof value !== 'string') {
    return false
  }
  try {
    parseCategoryInput(value)
    return true
  } catch {
    return false
  }
}
