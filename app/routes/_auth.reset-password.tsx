import type { MetaFunction } from '@remix-run/node'
import { useTranslations } from 'use-intl'
import {
  Form,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import type { AuthContext } from './_auth'
import { cxFormInput, cxWithGrowFadeMd } from '~/utils/helpers'
import { useErrorMessages } from '~/presentation/hooks'
import { passwordSchema } from '~/utils/schemas'
import { useFormik } from 'formik'
import { confirmPasswordReset } from 'firebase/auth'
import { clientAuth } from '~/infra/firebase.client'

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Reset Password',
    },
  ]
}

export default function ResetPassword() {
  const t = useTranslations()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [transition] = useOutletContext<AuthContext>()
  const { errorToString } = useErrorMessages()
  const [showConfirmation, setConfirmation] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const oobCode = searchParams.get('oobCode')

  useEffect(() => {
    if (!oobCode) {
      navigate('/login')
    }
  }, [navigate, oobCode])

  const initialValues = {
    password: '',
    passwordConfirmation: '',
  }

  const { values, errors, handleSubmit, setFieldValue, setFieldError } =
    useFormik({
      initialValues,
      validationSchema: passwordSchema,
      validateOnChange: false,
      validateOnBlur: false,
      onSubmit: async (values) => {
        setShowErrorMessage(false)
        if (!oobCode) {
          setShowErrorMessage(true)
          setErrorMessage(t('auth.errors.no-password-reset-code'))
          return
        }
        try {
          await confirmPasswordReset(clientAuth, oobCode, values.password)
          setConfirmation(true)
        } catch (error) {
          // show error with existing user
          setShowErrorMessage(true)
          setErrorMessage(t('auth.errors.unknown-error'))
        }
      },
    })

  const goToLogin = async () => {
    await transition()
    navigate('/login')
  }

  const clearErrors = () => {
    setFieldError('password', undefined)
    setFieldError('passwordConfirmation', undefined)
  }

  return (
    <Form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{t('auth.reset-password')}</h2>
        <p className={cxWithGrowFadeMd('', !showConfirmation)}>
          {t('auth.enter-new-password')}
        </p>
        <p
          className={cxWithGrowFadeMd(
            'font-bold text-confirmation',
            showConfirmation,
          )}
        >
          {t('auth.password-updated')}
        </p>
      </div>
      <div
        className={cxWithGrowFadeMd('flex flex-col gap-4', !showConfirmation)}
      >
        <input
          type="password"
          name="password"
          value={values.password}
          placeholder={t('common.password')}
          className={cxFormInput({ hasError: errors.password })}
          onChange={(e) => setFieldValue('password', e.target.value)}
          onBlur={clearErrors}
        />
        <input
          type="password"
          name="passwordConfirmation"
          value={values.passwordConfirmation}
          placeholder={t('common.password-check')}
          className={cxFormInput({ hasError: errors.password })}
          onChange={(e) =>
            setFieldValue('passwordConfirmation', e.target.value)
          }
          onBlur={clearErrors}
        />
      </div>
      <p
        className={cxWithGrowFadeMd(
          'text-error font-bold',
          showErrorMessage || Object.keys(errors).length > 0,
        )}
      >
        {errorToString(errorMessage)}
        {errors.password
          ? errorToString(errors.password)
          : errorToString(errors.passwordConfirmation)}
      </p>
      <div className="flex flex-col gap-4">
        {!showConfirmation && (
          <button className="btn-primary btn" type="submit">
            {t('common.submit')}
          </button>
        )}
        {showConfirmation && (
          <button
            className="btn-secondary btn"
            type="button"
            onClick={goToLogin}
          >
            {t('auth.login')}
          </button>
        )}
      </div>
    </Form>
  )
}
