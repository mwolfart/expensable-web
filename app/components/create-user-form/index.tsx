import { FC, useReducer } from 'react'
import { useTranslations } from 'use-intl'
import { newUserReducer } from './new-user-reducer'

type Props = {
  onSubmit: (email: string, name: string, password: string) => void
  onGoToLogin: () => void
}

export const CreateUserForm: FC<Props> = ({ onSubmit, onGoToLogin }) => {
  const t = useTranslations()
  const [userData, updateUserData] = useReducer(newUserReducer, {
    email: '',
    name: '',
    password: '',
    passwordCheck: '',
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold">{t('auth.create-account')}</h2>
        <p>{t('auth.enter-data')}</p>
      </div>
      <input
        type="email"
        placeholder={t('common.email')}
        className="input w-full bg-white"
        onChange={(evt) => updateUserData({ email: evt.target.value })}
      />
      <input
        placeholder={t('common.name')}
        className="input w-full bg-white"
        onChange={(evt) => updateUserData({ name: evt.target.value })}
      />
      <input
        type="password"
        placeholder={t('common.password')}
        className="input w-full bg-white"
        onChange={(evt) => updateUserData({ password: evt.target.value })}
      />
      <input
        type="password"
        placeholder={t('common.password-check')}
        className="input w-full bg-white"
        onChange={(evt) => updateUserData({ passwordCheck: evt.target.value })}
      />
      <div className="flex flex-col gap-4">
        <button
          className="btn-primary btn"
          onClick={() =>
            onSubmit(userData.email, userData.name, userData.password)
          }
        >
          {t('common.submit')}
        </button>
        <button className="btn-link btn" onClick={onGoToLogin}>
          {t('auth.already-have-account')}
        </button>
      </div>
    </div>
  )
}
