import { hashToken } from '@utils/jwt'
import { compare } from 'bcrypt'
import { prisma } from '~/db.server'
import { getUserByEmail } from './user.server'

interface TokenInfo {
  jti: string
  refreshToken: string
  userId: string
}

export const addRefreshTokenToWhitelist = ({
  jti,
  refreshToken,
  userId,
}: TokenInfo) =>
  prisma.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId,
    },
  })

export const findRefreshTokenById = (id: string) =>
  prisma.refreshToken.findUnique({
    where: {
      id,
    },
  })

export const deleteRefreshToken = (id: string) =>
  prisma.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  })

export const revokeTokens = (userId: string) =>
  prisma.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  })

export const verifyLogin = async (email: string, password: string) => {
  const user = await getUserByEmail(email)
  if (user) {
    const validPassword = await compare(password, user.password)
    if (validPassword) {
      return user
    }
  }
}
