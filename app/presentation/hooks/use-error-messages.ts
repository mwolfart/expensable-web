import { useTranslations } from 'use-intl'
import { ErrorCodes } from '~/utils/enum'

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
        return t('auth.errors.password-mismatch')
      case ErrorCodes.PASSWORD_SHORT:
        return t('auth.errors.password-short')
      case ErrorCodes.PASSWORD_INVALID:
        return t('auth.errors.password-rules')
      case ErrorCodes.DUPLICATE_USER:
        return t('auth.errors.account-exists')
      case ErrorCodes.CATEGORY_DUPLICATE:
        return t('category.errors.duplicate')
      case ErrorCodes.CATEGORY_EMPTY:
        return t('category.errors.empty')
      case ErrorCodes.INVALID_ID:
        return t('common.errors.invalid-id')
      case ErrorCodes.AMOUNT_INVALID:
        return t('common.errors.invalid-amount')
      case ErrorCodes.AMOUNT_PER_MONTH_INVALID:
        return t('expenses.errors.amount-per-month-invalid')
      case ErrorCodes.AMOUNT_PER_MONTH_REQUIRED:
        return t('expenses.errors.amount-per-month-required')
      case ErrorCodes.AMOUNT_OF_MONTHS_INVALID:
        return t('expenses.errors.amount-of-months-invalid')
      case ErrorCodes.AMOUNT_OF_MONTHS_REQUIRED:
        return t('expenses.errors.amount-of-months-required')
      case ErrorCodes.CHANGE_VALUES_INVALID:
        return t('expenses.errors.change-values-invalid')
      case ErrorCodes.BAD_CATEGORY_DATA:
        return t('expenses.errors.bad-category-data')
      case ErrorCodes.BAD_DATE_FORMAT:
        return t('common.errors.invalid-date')
      case ErrorCodes.DATE_REQUIRED:
        return t('common.errors.date-required')
      case ErrorCodes.BAD_FORMAT:
        return t('common.errors.bad-format')
      case ErrorCodes.INSTALLMENTS_REQUIRED:
        return t('expenses.errors.installments-required')
      case ErrorCodes.TOO_MANY_INSTALLMENTS:
        return t('expenses.errors.installments-too-many')
      case ErrorCodes.EXPENSES_REQUIRED:
        return t('transactions.errors.expenses-required')
      case ErrorCodes.LOGIN_UNKNOWN:
        return t('auth.errors.unknown-error')
      case ErrorCodes.REGISTER_UNKNOWN:
        return t('auth.errors.unknown-error')
      case ErrorCodes.PWD_RESET_UNKNOWN:
        return t('auth.errors.unknown-error')
      default:
        return code
    }
  }

  return {
    errorToString,
  }
}
