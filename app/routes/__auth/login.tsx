import type { ActionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useEffect, useState } from 'react'
import { timeout } from '~/utils/timeout'
import {
  Form,
  useActionData,
  useFetcher,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'
import { useTranslations } from 'use-intl'
import { cxFormInput, cxWithFade } from '~/utils'
import { useErrorMessages } from '~/hooks'
import { ErrorCodes, loginSchema } from '~/utils/schemas'
import type { AuthContext } from '../__auth'
import { getIdToken, signInWithEmailAndPassword } from 'firebase/auth'
import { useFormik } from 'formik'
import { clientAuth } from '~/utils/firebase.client'
import { serverAuth } from '~/utils/firebase.server'
import { createSession } from '~/session.server'

export async function action({ request }: ActionArgs) {
  try {
    const formData = await request.formData()
    const idToken = formData.get('idToken')?.toString()

    if (!idToken) {
      return json({ error: ErrorCodes.LOGIN_INVALID }, { status: 400 })
    }

    await serverAuth.verifyIdToken(idToken)
    return await createSession(idToken)
  } catch (error) {
    return json({ error: ErrorCodes.LOGIN_UNKNOWN }, { status: 500 })
  }
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
  const fetcher = useFetcher()
  const [transition] = useOutletContext<AuthContext>()
  const { errorToString } = useErrorMessages()
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const initialValues = { email: '', password: '' }

  const { values, errors, setFieldValue, handleSubmit } = useFormik({
    initialValues,
    validationSchema: loginSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async ({ email, password }) => {
      setShowErrorMessage(false)
      try {
        const credentials = await signInWithEmailAndPassword(
          clientAuth,
          email,
          password,
        )
        const idToken = await getIdToken(credentials.user)
        if (idToken) {
          fetcher.submit({ idToken }, { method: 'post' })
        }
      } catch (e) {
        setShowErrorMessage(true)
        setErrorMessage(t('auth.errors.invalid-credentials'))
      }
    },
  })

  useEffect(() => {
    const parseAction = async () => {
      if (actionData?.error === ErrorCodes.LOGIN_INVALID) {
        setErrorMessage(t('auth.errors.invalid-credentials'))
      } else if (actionData?.error) {
        setErrorMessage(t('auth.errors.unknown-error'))
      }

      if (actionData?.error) {
        setShowErrorMessage(true)
        await timeout(5000)
        setShowErrorMessage(false)
      }
    }
    parseAction()
  }, [actionData, errorToString, t])

  const goToCreateAccount = async () => {
    await transition()
    navigate('/create-user')
  }

  const goToForgotPassword = async () => {
    await transition()
    navigate('/forgot-password')
  }

  const invalidCredentialClasses = cxWithFade(
    'font-bold text-primary',
    showErrorMessage,
  )

  return (
    <Form method="post" className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <div className="flex flex-col">
        <span className="pl-6">{t('auth.welcome')}</span>
        <h2 className="font-bold">{t('auth.expensable')}</h2>
      </div>
      <input
        type="email"
        name="email"
        value={values.email}
        placeholder={errorToString(errors.email) || t('common.email')}
        className={cxFormInput({ hasError: errors.email })}
        onChange={(e) => setFieldValue('email', e.target.value)}
      />
      <input
        type="password"
        name="password"
        value={values.password}
        placeholder={errorToString(errors.password) || t('common.password')}
        className={cxFormInput({ hasError: errors.password })}
        onChange={(e) => setFieldValue('password', e.target.value)}
      />
      <p className={invalidCredentialClasses}>{errorMessage}</p>
      <div className="flex flex-col gap-4">
        <button className="btn-primary btn" type="submit">
          {t('auth.login')}
        </button>
        <button
          className="btn-outline btn-primary btn"
          onClick={goToCreateAccount}
          type="button"
        >
          {t('auth.create-account')}
        </button>
      </div>
      <button
        className="btn-link btn"
        type="button"
        onClick={goToForgotPassword}
      >
        {t('auth.forgot-password')}
      </button>
    </Form>
  )
}
