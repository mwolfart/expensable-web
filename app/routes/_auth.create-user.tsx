import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { createUser } from '~/infra/models/user.server'
import { useTranslation } from 'react-i18next'
import {
  Form,
  useFetcher,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'
import { useState } from 'react'
import type { AuthContext } from './_auth'
import { cxFormInput, cxWithGrowFadeMd } from '~/utils/helpers'
import { useErrorMessages } from '~/presentation/hooks'
import { userSchema } from '~/utils/schemas/form'
import { ErrorCodes } from '~/utils/enum'
import { useFormik } from 'formik'
import { createUserWithEmailAndPassword, getIdToken } from 'firebase/auth'
import { clientAuth } from '~/infra/firebase.client'
import { serverAuth } from '~/infra/firebase.server'

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData()
    const idToken = formData.get('idToken') as string
    const email = formData.get('email') as string
    const name = formData.get('name') as string

    if (!idToken) {
      return json({ error: ErrorCodes.LOGIN_INVALID }, { status: 400 })
    }
    await serverAuth.verifyIdToken(idToken)
    const createdUser = await createUser(email.toLowerCase(), name)

    if (!createdUser) {
      return json({ error: ErrorCodes.REGISTER_UNKNOWN }, { status: 500 })
    }
    return json({ success: true, error: null }, { status: 200 })
  } catch (e) {
    return json({ error: ErrorCodes.BAD_FORMAT }, { status: 400 })
  }
}

export default function CreateUser() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const [transition] = useOutletContext<AuthContext>()
  const { errorToString } = useErrorMessages()
  const [showConfirmation, setConfirmation] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const initialValues = {
    email: '',
    password: '',
    passwordConfirmation: '',
    name: '',
  }

  const { values, errors, handleSubmit, setFieldValue, setFieldError } =
    useFormik({
      initialValues,
      validationSchema: userSchema,
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: async (values) => {
        setShowErrorMessage(false)
        try {
          const credentials = await createUserWithEmailAndPassword(
            clientAuth,
            values.email,
            values.password,
          )
          const idToken = await getIdToken(credentials.user)

          if (idToken) {
            fetcher.submit(
              { idToken, email: values.email, name: values.name },
              { method: 'post' },
            )
            setConfirmation(true)
          }
        } catch (error) {
          setShowErrorMessage(true)
          setConfirmation(false)
          const hasDuplicateUser =
            error &&
            typeof error === 'object' &&
            'code' in error &&
            typeof error.code === 'string' &&
            error.code.includes('email-already-in-use')
          if (hasDuplicateUser) {
            setErrorMessage(t('auth.errors.account-exists'))
          } else {
            setErrorMessage(t('auth.errors.unknown-error'))
          }
        }
      },
    })

  const onGoToLogin = async () => {
    await transition()
    navigate('/login')
  }

  const passwordError = errors.password || errors.passwordConfirmation

  return (
    <Form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{t('auth.create-account')}</h2>
        <p>{t('auth.enter-data')}</p>
      </div>
      <input
        type="email"
        name="email"
        value={values.email}
        placeholder={errors.email || t('common.email')}
        className={cxFormInput({ hasError: errors.email })}
        onChange={(e) => setFieldValue('email', e.target.value)}
        onBlur={() => setFieldError('email', undefined)}
      />
      <input
        name="name"
        value={values.name}
        placeholder={errors.name || t('common.name')}
        className={cxFormInput({ hasError: errors.name })}
        onChange={(e) => setFieldValue('name', e.target.value)}
        onBlur={() => setFieldError('name', undefined)}
      />
      <input
        type="password"
        name="password"
        value={values.password}
        placeholder={passwordError || t('common.password')}
        className={cxFormInput({ hasError: passwordError })}
        onChange={(e) => setFieldValue('password', e.target.value)}
        onBlur={() => {
          setFieldError('password', undefined)
          setFieldError('passwordConfirmation', undefined)
        }}
      />
      <input
        type="password"
        name="passwordConfirmation"
        value={values.passwordConfirmation}
        placeholder={passwordError || t('common.password-check')}
        className={cxFormInput({ hasError: passwordError })}
        onChange={(e) => setFieldValue('passwordConfirmation', e.target.value)}
        onBlur={() => {
          setFieldError('password', undefined)
          setFieldError('passwordConfirmation', undefined)
        }}
      />
      <p className={cxWithGrowFadeMd('text-confirmation', showConfirmation)}>
        {t('auth.account-created')}
      </p>
      <p className={cxWithGrowFadeMd('text-error', showErrorMessage)}>
        {errorToString(errorMessage)}
      </p>
      <div className="flex flex-col gap-4">
        <button className="btn-primary btn" type="submit">
          {t('common.submit')}
        </button>
        <button className="btn-link btn" type="button" onClick={onGoToLogin}>
          {t('auth.already-have-account')}
        </button>
      </div>
    </Form>
  )
}
