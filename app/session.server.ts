import type { User } from '@prisma/client'
import { getUserByEmail } from '~/models/user.server'
import { createCookie, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { serverAuth } from './firebase.server'

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set')
invariant(process.env.SESSION_TIMEOUT, 'SESSION_TIMEOUT must be set')

const sessionTimeoutMs =
  (process.env.SESSION_TIMEOUT as unknown as number) * 1000

const session = createCookie('session', {
  secrets: [process.env.SESSION_SECRET],
  expires: new Date(Date.now() + sessionTimeoutMs),
  path: '/',
})

export async function getSessionJwt(request: Request) {
  const jwt = await session.parse(request.headers.get('Cookie'))
  return jwt
}

export async function getLoggedUserProfile(
  request: Request,
): Promise<User | null> {
  const jwt = await getSessionJwt(request)

  if (!jwt) {
    return null
  }

  try {
    const token = await serverAuth.verifySessionCookie(jwt)
    if (token.email) {
      const userProfile = await getUserByEmail(token.email)
      return userProfile
    }
    return null
  } catch (e) {
    throw await logout()
  }
}

export async function getLoggedUserId(request: Request) {
  const profile = await getLoggedUserProfile(request)
  if (profile) {
    return profile.id
  }
  return null
}

export async function createSession(idToken: string) {
  const jwt = await serverAuth.createSessionCookie(idToken, {
    expiresIn: sessionTimeoutMs,
  })

  return redirect('/', {
    headers: {
      'Set-Cookie': await session.serialize(jwt),
    },
  })
}

export async function logout() {
  return redirect('/', {
    headers: {
      'Set-Cookie': await session.serialize('', {
        expires: new Date(0),
      }),
    },
  })
}
