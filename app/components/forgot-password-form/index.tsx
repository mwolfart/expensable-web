import cx from 'classnames'
import { FC, useState } from 'react'
import { useTranslations } from 'use-intl'
import { timeout } from '~/utils/timeout'

type Props = {
  onSubmit: (email: string) => void
  onGoToLogin: () => void
}

export const ForgotPasswordForm: FC<Props> = ({ onSubmit, onGoToLogin }) => {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [displayConfirmation, setConfirmation] = useState(false)

  const submit = async () => {
    setConfirmation(true)
    onSubmit(email)
    await timeout(3000)
    setConfirmation(false)
  }

  const confirmationClasses = cx(
    'font-bold text-primary transition',
    !displayConfirmation && 'pointer-events-none opacity-0',
    displayConfirmation && 'opacity-100',
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{t('auth.reset-password')}</h2>
        <p>{t('auth.forgot-password-copy')}</p>
      </div>
      <input
        type="email"
        placeholder={t('common.email')}
        className="input w-full bg-white"
        onChange={(evt) => setEmail(evt.target.value)}
      />
      <p className={confirmationClasses}>{t('auth.email-sent')}</p>
      <div className="flex flex-col gap-4">
        <button className="btn-primary btn" onClick={submit}>
          {t('auth.send-recovery-email')}
        </button>
        <button className="btn-outline btn-primary btn" onClick={onGoToLogin}>
          {t('common.back')}
        </button>
      </div>
    </div>
  )
}
