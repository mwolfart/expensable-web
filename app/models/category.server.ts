import { prisma } from '~/db.server'

export const getCategoryByTitle = (title: string) =>
  prisma.category.findUnique({
    where: {
      title,
    },
  })

export const createCategory = (userId: string, title: string) => {
  const category = {
    title,
    userId,
  }
  return prisma.category.create({
    data: category,
  })
}

export const deleteCategory = (id: string) =>
  prisma.category.delete({ where: { id } })
