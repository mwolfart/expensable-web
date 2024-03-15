import { prisma } from '~/infra/db.server'

export const getUserCategories = (id: string) =>
  prisma.user.findUnique({
    select: {
      categories: true,
    },
    where: {
      id,
    },
  })

export const getUserCategoriesByQuery = (id: string, text: string) =>
  prisma.category.findMany({
    where: {
      userId: id,
      title: text,
    },
  })

export const getCategoryById = (id: string) =>
  prisma.category.findUnique({
    where: {
      id,
    },
  })

export const getCategoryByTitleAndUser = (title: string, userId: string) =>
  prisma.category.findFirst({
    where: {
      title,
      userId,
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

export const updateCategory = (id: string, title: string) => {
  return prisma.category.update({
    where: {
      id,
    },
    data: {
      title,
    },
  })
}

export const deleteCategory = (id: string) =>
  prisma.category.delete({ where: { id } })
