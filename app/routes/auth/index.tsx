import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import { createUserSession, getUserId } from '~/session.server'
import { safeRedirect, validateEmail, validatePassword } from '~/utils/auth'
import { verifyLogin } from '~/models/auth.server'
import { useEffect, useState } from 'react'
import cx from 'classnames'
import { timeout } from '~/utils/timeout'
import { SignInForm } from '~/components/sign-in-form'
import { CreateUserForm } from '~/components/create-user-form'
import { ForgotPasswordForm } from '~/components/forgot-password-form'
import { useActionData, useSubmit } from '@remix-run/react'
import { useTranslations } from 'use-intl'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return json({})
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = safeRedirect('/')
  // const remember = formData.get('remember')

  if (!validateEmail(email)) {
    return json({ errors: { email: true, password: null } }, { status: 400 })
  }

  if (!validatePassword(password)) {
    return json({ errors: { email: null, password: true } }, { status: 400 })
  }

  const user = await verifyLogin(email, password)

  if (!user) {
    return json({ errors: { email: true, password: null } }, { status: 400 })
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: 'Authentication',
  }
}

type FormTypes = 'login' | 'create-account' | 'forgot-password'

export default function AuthPage() {
  const [isTransitioning, setTransitioning] = useState(false)
  const [currentForm, setCurrentForm] = useState<FormTypes>('login')
  const [showInvalidCredentials, setInvalidCredentials] = useState(false)
  const actionData = useActionData<typeof action>()
  const submit = useSubmit()

  useEffect(() => {
    const parseAction = async () => {
      if (actionData?.errors) {
        setInvalidCredentials(true)
        await timeout(5000)
        setInvalidCredentials(false)
      }
    }
    parseAction()
  }, [actionData])

  const transition = async () => {
    setTransitioning(true)
    await timeout(300)
    setTransitioning(false)
  }

  const onLogin = (email: string, password: string) => {
    setInvalidCredentials(false)
    submit({ email, password }, { method: 'post' })
  }
  const onCreateUser = (email: string, name: string, password: string) => {
    submit({ email, name, password }, { action: '/auth/join', method: 'post' })
  }
  const onResetPassword = (email: string) => {}

  const onGoToLogin = async () => {
    await transition()
    setCurrentForm('login')
  }

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
            showInvalidCredentials={showInvalidCredentials}
          />
        )}
        {currentForm === 'create-account' && (
          <CreateUserForm onSubmit={onCreateUser} onGoToLogin={onGoToLogin} />
        )}
        {currentForm === 'forgot-password' && (
          <ForgotPasswordForm
            onSubmit={onResetPassword}
            onGoToLogin={onGoToLogin}
          />
        )}
      </div>
    </div>
  )
}
