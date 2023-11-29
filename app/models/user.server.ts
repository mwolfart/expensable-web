import { prisma } from '~/db.server'

export const getUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: {
      email,
    },
  })

export const createUser = (email: string, fullName: string) => {
  const user = {
    email,
    fullName,
  }
  return prisma.user.create({
    data: user,
  })
}

export const getUserById = (id: string) =>
  prisma.user.findUnique({
    where: {
      id,
    },
  })
