import { useTranslations } from 'use-intl'

export enum ErrorCodes {
  INVALID_EMAIL = 'invalid_email',
  INVALID_LOGIN = 'invalid_login',
  INVALID_PASSWORD = 'invalid_password',
  INVALID_NAME = 'invalid_name',
  DUPLICATE_USER = 'duplicate_user',
}

export const useErrorMessages = () => {
  const t = useTranslations()

  const errorToString = (code?: string) => {
    switch (code) {
      case ErrorCodes.INVALID_EMAIL:
        return t('common.errors.invalid-field', {
          field: t('common.email'),
        })
      case ErrorCodes.INVALID_NAME:
        return t('common.errors.invalid-field', {
          field: t('common.name'),
        })
      case ErrorCodes.INVALID_PASSWORD:
        return t('common.errors.password-rules')
      case ErrorCodes.DUPLICATE_USER:
        return t('auth.errors.account-exists')
      default:
        return code
    }
  }

  return {
    errorToString,
  }
}
