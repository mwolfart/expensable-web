import { FC } from 'react'
import { useTranslations } from 'use-intl'

type Props = {
  onSubmit: () => void
}

export const SignInForm: FC<Props> = ({ onSubmit }) => {
  const t = useTranslations()
  return (
    <div className="flex flex-col gap-8">
      <h1>{t('login.welcome')}</h1>
      <input
        type="email"
        placeholder={t('common.email')}
        className="input w-full"
      />
    </div>
  )
}
