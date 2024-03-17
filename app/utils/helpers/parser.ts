import type { CategoryInputArray } from '../types'

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
