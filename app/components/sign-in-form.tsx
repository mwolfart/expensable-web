import { FC, useState } from 'react'
import { useTranslations } from 'use-intl'

type Props = {
  onSubmit: (email: string, password: string) => void
  onGoToCreateAccount: () => void
  onGoToForgotPassword: () => void
}

export const SignInForm: FC<Props> = ({
  onSubmit,
  onGoToCreateAccount,
  onGoToForgotPassword,
}) => {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <span className="pl-6">{t('login.welcome')}</span>
        <h2 className="font-bold">{t('login.expensable')}</h2>
      </div>
      <input
        type="email"
        placeholder={t('common.email')}
        className="input w-full bg-white"
        onChange={(evt) => setEmail(evt.target.value)}
      />
      <input
        type="password"
        placeholder={t('common.password')}
        className="input w-full bg-white"
        onChange={(evt) => setPassword(evt.target.value)}
      />
      <div className="flex flex-col gap-4">
        <button
          className="btn-primary btn"
          onClick={() => onSubmit(email, password)}
        >
          {t('login.login')}
        </button>
        <button
          className="btn-outline btn-primary btn"
          onClick={onGoToCreateAccount}
        >
          {t('login.create-account')}
        </button>
      </div>
      <button className="btn-link btn" onClick={onGoToForgotPassword}>
        {t('login.forgot-password')}
      </button>
    </div>
  )
}
