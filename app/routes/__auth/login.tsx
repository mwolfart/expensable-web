import type { ActionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { createUserSession } from '~/session.server'
import { safeRedirect } from '~/utils/auth'
import { verifyLogin } from '~/models/auth.server'
import { useEffect, useReducer, useState } from 'react'
import { timeout } from '~/utils/timeout'
import {
  Form,
  useActionData,
  useOutletContext,
  useNavigate,
} from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { cxFormInput, cxWithFade, getYupErrors } from '~/utils'
import { useErrorMessages } from '~/hooks'
import { ErrorCodes, loginSchema } from '~/utils/schemas'
import type { AuthContext } from '../__auth'

type FormErrors = { email?: string; password?: string }

const errorsReducer = (state: FormErrors, action: FormErrors) => ({
  ...state,
  ...action,
})

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = safeRedirect('/')
  // const remember = formData.get('remember')

  try {
    await loginSchema.validate({ email, password }, { abortEarly: false })
  } catch (e) {
    const errors = getYupErrors(e) as FormErrors
    return json({ errors }, { status: 400 })
  }

  const user = await verifyLogin(email, password)

  if (!user) {
    return json(
      { errors: { email: ErrorCodes.LOGIN_INVALID } as FormErrors },
      { status: 400 },
    )
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
  const actionData = useActionData<typeof action>()
  const [transition] = useOutletContext<AuthContext>()
  const { errorToString } = useErrorMessages()
  const [showInvalidCredentials, setInvalidCredentials] = useState(false)
  const [loginErrors, updateLoginErrors] = useReducer(errorsReducer, {
    email: '',
    password: '',
  })

  useEffect(() => {
    const parseAction = async () => {
      if (
        actionData?.errors &&
        actionData.errors.email === ErrorCodes.LOGIN_INVALID
      ) {
        setInvalidCredentials(true)
        await timeout(5000)
        setInvalidCredentials(false)
      } else if (actionData?.errors) {
        updateLoginErrors({
          email: errorToString(actionData.errors.email),
          password: errorToString(actionData.errors.password),
        })
      }
    }
    parseAction()
  }, [actionData, errorToString])

  const onGoToCreateAccount = async () => {
    await transition()
    navigate('/create-user')
  }

  const onGoToForgotPassword = async () => {
    await transition()
    navigate('/forgot-password')
  }

  const invalidCredentialClasses = cxWithFade(
    'font-bold text-primary',
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
        placeholder={loginErrors.email || t('common.email')}
        className={cxFormInput({ hasError: loginErrors.email })}
        onChange={() => updateLoginErrors({ email: '' })}
      />
      <input
        type="password"
        name="password"
        placeholder={loginErrors.password || t('common.password')}
        className={cxFormInput({ hasError: loginErrors.password })}
        onChange={() => updateLoginErrors({ password: '' })}
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
