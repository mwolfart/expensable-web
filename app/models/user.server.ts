import type { User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { prisma } from '~/db.server'

export const getUserByEmail = (email: string) =>
  prisma.user.findUnique({
    where: {
      email,
    },
  })

export const createUser = (
  email: string,
  password: string,
  fullName: string,
) => {
  const user: User = {
    email,
    fullName,
    password: bcrypt.hashSync(password, 12),
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
