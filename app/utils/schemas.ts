import * as yup from 'yup'
import { isDateValid, isFixedExpenseAmountPerMonthValid } from './helpers'

export enum ErrorCodes {
  EMAIL_INVALID = 'invalid_email',
  EMAIL_REQUIRED = 'required_email',
  LOGIN_INVALID = 'invalid_login',
  LOGIN_UNKNOWN = 'unknown_login_error',
  REGISTER_UNKNOWN = 'unknown_register_error',
  PASSWORD_INVALID = 'invalid_password',
  PASSWORD_REQUIRED = 'required_password',
  PASSWORD_SHORT = 'short_password',
  PASSWORD_MISMATCH = 'password_mismatch',
  PWD_RESET_UNKNOWN = 'password_reset_unknown',
  NAME_REQUIRED = 'required_name',
  TITLE_REQUIRED = 'required_title',
  AMOUNT_REQUIRED = 'amount_required',
  DUPLICATE_USER = 'duplicate_user',
  CATEGORY_DUPLICATE = 'duplicate_category',
  CATEGORY_EMPTY = 'empty_category',
  INVALID_ID = 'invalid_id',
  AMOUNT_INVALID = 'amount_invalid',
  AMOUNT_PER_MONTH_INVALID = 'amount_per_month_invalid',
  AMOUNT_PER_MONTH_REQUIRED = 'amount_per_month_invalid',
  AMOUNT_OF_MONTHS_INVALID = 'amount_of_month_invalid',
  AMOUNT_OF_MONTHS_REQUIRED = 'amount_of_month_invalid',
  CHANGE_VALUES_INVALID = 'change_values_invalid',
  BAD_CATEGORY_DATA = 'bad_category_data',
  BAD_DATE_FORMAT = 'bad_date_format',
  BAD_FORMAT = 'bad_format',
}

export const emailSchema = yup
  .string()
  .required(ErrorCodes.EMAIL_REQUIRED)
  .matches(
    /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+(\.[a-zA-Z]+)+$/,
    ErrorCodes.EMAIL_INVALID,
  )

export const passwordSchema = yup.object({
  password: yup
    .string()
    .required(ErrorCodes.PASSWORD_REQUIRED)
    .min(8, ErrorCodes.PASSWORD_SHORT)
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      ErrorCodes.PASSWORD_INVALID,
    ),
  passwordConfirmation: yup
    .string()
    .equals(['password'], ErrorCodes.PASSWORD_MISMATCH),
})

export const userSchema = yup.object({
  email: emailSchema,
  password: yup
    .string()
    .required(ErrorCodes.PASSWORD_REQUIRED)
    .min(8, ErrorCodes.PASSWORD_SHORT)
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      ErrorCodes.PASSWORD_INVALID,
    ),
  passwordConfirmation: yup
    .string()
    .when(['password'], (password, schema) =>
      schema.notOneOf(
        [password as unknown as yup.Reference],
        ErrorCodes.PASSWORD_MISMATCH,
      ),
    ),
  name: yup.string().required(ErrorCodes.NAME_REQUIRED),
})

export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required(ErrorCodes.PASSWORD_REQUIRED),
})

export const fixedExpenseSchema = yup.object().shape({
  id: yup.string(),
  name: yup.string().required(),
  startDate: yup
    .string()
    .test('is-date-valid', ErrorCodes.BAD_DATE_FORMAT, isDateValid)
    .required(),
  changesValues: yup
    .string()
    .oneOf(['1', '0'], ErrorCodes.CHANGE_VALUES_INVALID),
  amount: yup.string().when('changesValues', {
    is: '0',
    then: (schema) =>
      schema
        .matches(/^\d+(\.\d+)?$/, ErrorCodes.AMOUNT_INVALID)
        .required(ErrorCodes.AMOUNT_REQUIRED),
  }),
  amountPerMonth: yup.string().when('changesValues', {
    is: '1',
    then: (schema) =>
      schema
        .test(
          'is-apm-valid',
          ErrorCodes.AMOUNT_PER_MONTH_INVALID,
          isFixedExpenseAmountPerMonthValid,
        )
        .required(ErrorCodes.AMOUNT_PER_MONTH_REQUIRED),
  }),
  amountOfMonths: yup
    .string()
    .matches(/^\d$/, ErrorCodes.AMOUNT_OF_MONTHS_INVALID)
    .required(ErrorCodes.AMOUNT_OF_MONTHS_REQUIRED),
  categoryId: yup.string(),
})
