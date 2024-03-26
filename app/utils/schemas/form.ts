import * as yup from 'yup'
import { ErrorCodes } from '../enum'
import { isDateValid } from '../helpers'

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
    .equals([yup.ref('password')], ErrorCodes.PASSWORD_MISMATCH),
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

export const expenseSchema = yup.object().shape({
  title: yup.string().required(ErrorCodes.NAME_REQUIRED),
  amount: yup.number().required(ErrorCodes.AMOUNT_REQUIRED),
  unit: yup.number().nullable(),
  date: yup
    .string()
    .test('is-date-valid', ErrorCodes.BAD_DATE_FORMAT, isDateValid)
    .required(ErrorCodes.DATE_REQUIRED),
  installments: yup.number().required(ErrorCodes.INSTALLMENTS_REQUIRED),
})

export const transactionSchema = yup.object().shape({
  title: yup.string().required(ErrorCodes.TITLE_REQUIRED),
  date: yup
    .string()
    .test('is-date-valid', ErrorCodes.BAD_DATE_FORMAT, isDateValid)
    .required(ErrorCodes.DATE_REQUIRED),
  expenses: yup.array(
    expenseSchema.shape({
      date: yup.string().optional(),
    }),
  ),
})

export const fixedExpenseSchema = yup.object().shape({
  title: yup.string().required(),
  date: yup.string().required(),
  categoryId: yup.string().nullable().optional(),
  varyingCosts: yup.boolean(),
  amount: yup.number().when('varyingCosts', {
    is: false,
    then: (schema) => schema.required(),
  }),
  amountOfMonths: yup
    .number()
    .when('varyingCosts', {
      is: false,
      then: (schema) => schema.required(),
    })
    .required(),
  amountPerMonth: yup.array(yup.number()).when('varyingCosts', {
    is: true,
    then: (schema) => schema.required(),
  }),
})
