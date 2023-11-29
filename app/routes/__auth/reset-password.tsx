import type { MetaFunction } from '@remix-run/node'
import { useTranslations } from 'use-intl'
import {
  Form,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import type { AuthContext } from '../__auth'
import { cxFormInput, cxWithGrowFadeMd } from '~/utils'
import { useErrorMessages } from '~/hooks'
import { passwordSchema } from '~/utils/schemas'
import { useFormik } from 'formik'
import { confirmPasswordReset } from 'firebase/auth'
import { clientAuth } from '~/utils/firebase.client'

export const meta: MetaFunction = () => {
  return {
    title: 'Reset Password',
  }
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

  return (
    <Form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{t('auth.reset-password')}</h2>
        <p>{t('auth.enter-new-password')}</p>
      </div>
      <div
        className={cxWithGrowFadeMd('flex flex-col gap-4', !showConfirmation)}
      >
        <input
          type="password"
          name="password"
          value={values.password}
          placeholder={errors.password || t('common.password')}
          className={cxFormInput({ hasError: errors.password })}
          onChange={(e) => setFieldValue('password', e.target.value)}
          onBlur={() => setFieldError('password', undefined)}
        />
        <input
          type="password"
          name="passwordConfirmation"
          value={values.passwordConfirmation}
          placeholder={errors.password || t('common.password-check')}
          className={cxFormInput({ hasError: errors.password })}
          onChange={(e) =>
            setFieldValue('passwordConfirmation', e.target.value)
          }
          onBlur={() => setFieldError('password', undefined)}
        />
      </div>
      <p className={cxWithGrowFadeMd('', showConfirmation)}>
        {t('auth.password-updated')}
      </p>
      <p className={cxWithGrowFadeMd('', showErrorMessage)}>
        {errorToString(errorMessage)}
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
