export const areAllValuesEmpty = (filter: { [key: string]: unknown }) =>
  Object.values(filter).every((v) => !v)
