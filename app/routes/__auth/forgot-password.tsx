import type { ActionArgs, MetaFunction } from '@remix-run/node'
import { useTranslations } from 'use-intl'
import { Form, useNavigate, useOutletContext } from '@remix-run/react'
import { useState } from 'react'
import { cxWithFade } from '~/utils'
import { timeout } from '~/utils/timeout'
import type { AuthContext } from '../__auth'

const CONFIRMATION_TIMEOUT = 5000

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()
  const email = formData.get('email')

  if (email && typeof email === 'string' && email.length > 1) {
    // const result = sendPasswordResetEmail(email)
    // return result
    return false
  }

  return false
}

export const meta: MetaFunction = () => {
  return {
    title: 'Forgot Password',
  }
}

export default function ForgotPassword() {
  const t = useTranslations()
  const navigate = useNavigate()
  const [transition] = useOutletContext<AuthContext>()
  const [displayConfirmation, setConfirmation] = useState(false)

  const submit = async () => {
    setConfirmation(true)
    await timeout(CONFIRMATION_TIMEOUT)
    setConfirmation(false)
  }

  const onGoToLogin = async () => {
    await transition()
    navigate('/login')
  }

  const confirmationClasses = cxWithFade(
    'font-bold text-confirmation',
    displayConfirmation,
  )

  return (
    <Form method="post" className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{t('auth.reset-password')}</h2>
        <p>{t('auth.forgot-password-copy')}</p>
      </div>
      <input
        type="email"
        name="email"
        placeholder={t('common.email')}
        className="input w-full bg-white"
      />
      <p className={confirmationClasses}>{t('auth.email-sent')}</p>
      <div className="flex flex-col gap-4">
        <button className="btn-primary btn" type="submit" onClick={submit}>
          {t('auth.send-recovery-email')}
        </button>
        <button
          className="btn-outline btn-primary btn"
          type="button"
          onClick={onGoToLogin}
        >
          {t('common.back')}
        </button>
      </div>
    </Form>
  )
}
