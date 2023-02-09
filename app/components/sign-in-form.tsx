import { FC } from 'react'
import { useTranslations } from 'use-intl'

type Props = {
  onSubmit: () => void
}

export const SignInForm: FC<Props> = ({ onSubmit }) => {
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <span className="pl-6">{t('login.welcome')}</span>
        <h2 className="font-bold text-slate-600">{t('login.expensable')}</h2>
      </div>
      <input
        type="email"
        placeholder={t('common.email')}
        className="input w-full bg-white"
      />
      <input
        type="password"
        placeholder={t('common.password')}
        className="input w-full bg-white"
      />
      <button className="btn-primary">{t('login.login')}</button>
    </div>
  )
}
