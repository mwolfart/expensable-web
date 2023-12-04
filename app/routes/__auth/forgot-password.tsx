import type { MetaFunction } from '@remix-run/node'
import { useTranslations } from 'use-intl'
import { useNavigate, useOutletContext } from '@remix-run/react'
import { useState } from 'react'
import { cxFormInput, cxWithFade, timeout } from '~/utils/helpers'
import type { AuthContext } from '../__auth'
import { ErrorCodes, emailSchema } from '~/utils/schemas'
import { useErrorMessages } from '~/presentation/hooks'
import { sendPasswordResetEmail } from 'firebase/auth'
import { clientAuth } from '~/infra/firebase.client'

const CONFIRMATION_TIMEOUT = 5000

export const meta: MetaFunction = () => {
  return {
    title: 'Forgot Password',
  }
}

export default function ForgotPassword() {
  const t = useTranslations()
  const navigate = useNavigate()
  const [transition] = useOutletContext<AuthContext>()
  const { errorToString } = useErrorMessages()
  const [displayConfirmation, setConfirmation] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    const isEmailValid = await emailSchema.isValid(email)
    if (!email) {
      setError(ErrorCodes.EMAIL_REQUIRED)
    } else if (!isEmailValid) {
      setError(ErrorCodes.EMAIL_INVALID)
    } else {
      setError('')
      try {
        await sendPasswordResetEmail(clientAuth, email)
        setConfirmation(true)
        await timeout(CONFIRMATION_TIMEOUT)
        setConfirmation(false)
      } catch (e) {
        setError(ErrorCodes.PWD_RESET_UNKNOWN)
      }
    }
  }

  const goToLogin = async () => {
    await transition()
    navigate('/login')
  }

  const confirmationClasses = cxWithFade(
    'font-bold text-confirmation',
    displayConfirmation,
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{t('auth.reset-password')}</h2>
        <p>{t('auth.forgot-password-copy')}</p>
      </div>
      <input
        type="email"
        name="email"
        value={email}
        placeholder={error ? errorToString(error) : t('common.email')}
        className={cxFormInput({ hasError: error })}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setError('')}
      />
      <p className={confirmationClasses}>{t('auth.email-sent')}</p>
      <div className="flex flex-col gap-4">
        <button className="btn-primary btn" type="submit" onClick={submit}>
          {t('auth.send-recovery-email')}
        </button>
        <button
          className="btn-outline btn-primary btn"
          type="button"
          onClick={goToLogin}
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  )
}
