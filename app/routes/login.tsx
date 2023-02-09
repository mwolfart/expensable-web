import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import { createUserSession, getUserId } from '~/session.server'
import { safeRedirect, validateEmail } from '@utils/auth'
import { verifyLogin } from '@models/auth.server'
import { SignInForm } from '@components/sign-in-form'
import { useState } from 'react'
import cx from 'classnames'
import { timeout } from '~/utils/timeout'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return json({})
}

// export async function action({ request }: ActionArgs) {
//   const formData = await request.formData()
//   const email = formData.get('email')
//   const password = formData.get('password')
//   const redirectTo = safeRedirect(formData.get('redirectTo'), '/')
//   const remember = formData.get('remember')

//   if (!validateEmail(email)) {
//     return json(
//       { errors: { email: 'Email is invalid', password: null } },
//       { status: 400 },
//     )
//   }

//   if (typeof password !== 'string' || password.length === 0) {
//     return json(
//       { errors: { email: null, password: 'Password is required' } },
//       { status: 400 },
//     )
//   }

//   if (password.length < 8) {
//     return json(
//       { errors: { email: null, password: 'Password is too short' } },
//       { status: 400 },
//     )
//   }

//   const user = await verifyLogin(email, password)

//   if (!user) {
//     return json(
//       { errors: { email: 'Invalid email or password', password: null } },
//       { status: 400 },
//     )
//   }

//   return createUserSession({
//     request,
//     userId: user.id,
//     remember: remember === 'on' ? true : false,
//     redirectTo,
//   })
// }

export const meta: MetaFunction = () => {
  return {
    title: 'Login',
  }
}

type FormTypes = 'login' | 'create-account' | 'forgot-password'

export default function LoginPage() {
  const [isTransitioning, setTransitioning] = useState(false)
  const [currentForm, setCurrentForm] = useState<FormTypes>('login')

  const transition = async () => {
    setTransitioning(true)
    await timeout(300)
    setTransitioning(false)
  }

  const onLogin = (email: string, password: string) => {}

  const onGoToCreateAccount = async () => {
    await transition()
    setCurrentForm('create-account')
  }

  const onGoToForgotPassword = async () => {
    await transition()
    setCurrentForm('forgot-password')
  }

  const panelClasses = cx(
    'w-full rounded-xl bg-foreground p-8 md:w-1/2 xl:w-1/3 transition duration-300',
    isTransitioning && 'translate-x-[-600px]',
  )

  return (
    <div className="flex h-full items-center p-8 sm:p-16">
      <div className={panelClasses}>
        {currentForm === 'login' && (
          <SignInForm
            onSubmit={onLogin}
            onGoToCreateAccount={onGoToCreateAccount}
            onGoToForgotPassword={onGoToForgotPassword}
          />
        )}
        {currentForm === 'create-account' && (
          <SignInForm
            onSubmit={onLogin}
            onGoToCreateAccount={onGoToCreateAccount}
            onGoToForgotPassword={onGoToForgotPassword}
          />
        )}
        {currentForm === 'forgot-password' && (
          <SignInForm
            onSubmit={onLogin}
            onGoToCreateAccount={onGoToCreateAccount}
            onGoToForgotPassword={onGoToForgotPassword}
          />
        )}
      </div>
    </div>
  )
}
