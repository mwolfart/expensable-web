import * as yup from 'yup'
import { ErrorCodes } from '../enum'

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

export const fixedExpenseSchema = yup.object().shape({
  title: yup.string().required(),
  date: yup.string().required(),
  categoryId: yup.string(),
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
