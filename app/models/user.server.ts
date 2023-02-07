import type { User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { prisma } from '~/db.server'

export const getUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: {
      email,
    },
  })

export const createUserByEmailAndPassword = (user: User) => {
  user.password = bcrypt.hashSync(user.password, 12)
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
