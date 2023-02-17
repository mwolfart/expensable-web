import { useTranslations } from 'use-intl'
import { ErrorCodes } from '~/utils/schemas'

export const useErrorMessages = () => {
  const t = useTranslations()

  const errorToString = (code?: string) => {
    switch (code) {
      case ErrorCodes.EMAIL_REQUIRED:
        return t('common.errors.required-field', {
          field: t('common.email'),
        })
      case ErrorCodes.EMAIL_INVALID:
        return t('common.errors.invalid-field', {
          field: t('common.email'),
        })
      case ErrorCodes.NAME_REQUIRED:
        return t('common.errors.required-field', {
          field: t('common.name'),
        })
      case ErrorCodes.PASSWORD_REQUIRED:
        return t('common.errors.required-field', {
          field: t('common.password'),
        })
      case ErrorCodes.PASSWORD_MISMATCH:
        return t('common.errors.password-mismatch')
      case ErrorCodes.PASSWORD_SHORT:
        return t('common.errors.password-short')
      case ErrorCodes.PASSWORD_INVALID:
        return t('common.errors.password-rules')
      case ErrorCodes.DUPLICATE_USER:
        return t('auth.errors.account-exists')
      case ErrorCodes.CATEGORY_DUPLICATE:
        return t('category.errors.duplicate')
      case ErrorCodes.CATEGORY_EMPTY:
        return t('category.errors.empty')
      default:
        return code
    }
  }

  return {
    errorToString,
  }
}
