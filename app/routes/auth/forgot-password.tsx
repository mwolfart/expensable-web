import type { ActionArgs, MetaFunction } from '@remix-run/node'
import { useTranslations } from 'use-intl'
import {
  Form,
  useActionData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'
import { useState } from 'react'
import { cxWithFade } from '~/utils'
import { timeout } from '~/utils/timeout'
import { AuthContext } from '../auth'

export async function action({ request }: ActionArgs) {}

export const meta: MetaFunction = () => {
  return {
    title: 'Forgot Password',
  }
}

export default function CreateUser() {
  const t = useTranslations()
  const navigate = useNavigate()
  const [transition] = useOutletContext<AuthContext>()
  //   const [email, setEmail] = useState('')
  const [displayConfirmation, setConfirmation] = useState(false)

  const submit = async () => {
    setConfirmation(true)
    // onSubmit
    await timeout(3000)
    setConfirmation(false)
  }

  const onGoToLogin = async () => {
    await transition()
    navigate('/auth')
  }

  const confirmationClasses = cxWithFade(
    'font-bold text-primary',
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
