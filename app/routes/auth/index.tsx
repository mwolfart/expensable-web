import type { ActionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { createUserSession } from '~/session.server'
import { safeRedirect, validateEmail } from '~/utils/auth'
import { verifyLogin } from '~/models/auth.server'
import { useEffect, useState } from 'react'
import { timeout } from '~/utils/timeout'
import {
  Form,
  useActionData,
  useOutletContext,
  useNavigate,
} from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { cxWithFade } from '~/utils'
import { AuthContext } from '../auth'
import { ErrorCodes } from '~/hooks'

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = safeRedirect('/')
  // const remember = formData.get('remember')

  if (!validateEmail(email)) {
    return json({ errors: ErrorCodes.INVALID_EMAIL }, { status: 400 })
  }

  const user = await verifyLogin(email, password as string)

  if (!user) {
    return json({ errors: ErrorCodes.INVALID_LOGIN }, { status: 400 })
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
    title: 'Login',
  }
}

export default function Login() {
  const t = useTranslations()
  const navigate = useNavigate()
  const [transition] = useOutletContext<AuthContext>()
  const [showInvalidCredentials, setInvalidCredentials] = useState(false)

  const actionData = useActionData<typeof action>()

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

  const onGoToCreateAccount = async () => {
    await transition()
    navigate('/auth/create-user')
  }

  const onGoToForgotPassword = async () => {
    await transition()
    navigate('/auth/forgot-password')
  }

  const invalidCredentialClasses = cxWithFade(
    'font-bold text-primary transition',
    showInvalidCredentials,
  )

  return (
    <Form method="post" className="flex flex-col gap-8">
      <div className="flex flex-col">
        <span className="pl-6">{t('auth.welcome')}</span>
        <h2 className="font-bold">{t('auth.expensable')}</h2>
      </div>
      <input
        type="email"
        name="email"
        placeholder={t('common.email')}
        className="input w-full bg-white"
      />
      <input
        type="password"
        name="password"
        placeholder={t('common.password')}
        className="input w-full bg-white"
      />
      <p className={invalidCredentialClasses}>
        {t('auth.errors.invalid-credentials')}
      </p>
      <div className="flex flex-col gap-4">
        <button
          className="btn-primary btn"
          type="submit"
          onClick={() => setInvalidCredentials(false)}
        >
          {t('auth.login')}
        </button>
        <button
          className="btn-outline btn-primary btn"
          onClick={onGoToCreateAccount}
          type="button"
        >
          {t('auth.create-account')}
        </button>
      </div>
      <button
        className="btn-link btn"
        type="button"
        onClick={onGoToForgotPassword}
      >
        {t('auth.forgot-password')}
      </button>
    </Form>
  )
}
