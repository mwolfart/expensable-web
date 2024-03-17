import type { AnyObject, ObjectSchema, ValidationError } from 'yup'
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

export const validateServerSchema = (
  schema: ObjectSchema<AnyObject>,
  data: object,
) => {
  try {
    schema.validateSync(data, { abortEarly: false })
    return null
  } catch (e) {
    const vErr = e as ValidationError
    const errorObject = vErr.inner.reduce(
      (acc, err) => ({ ...acc, [err.path || 'unknown']: err.errors[0] }),
      {},
    )
    return {
      errors: errorObject,
    }
  }
}
