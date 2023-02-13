import * as yup from 'yup'

export enum ErrorCodes {
  EMAIL_INVALID = 'invalid_email',
  EMAIL_REQUIRED = 'required_email',
  LOGIN_INVALID = 'invalid_login',
  PASSWORD_INVALID = 'invalid_password',
  PASSWORD_REQUIRED = 'required_password',
  PASSWORD_SHORT = 'short_password',
  PASSWORD_MISMATCH = 'password_mismatch',
  NAME_REQUIRED = 'required_name',
  DUPLICATE_USER = 'duplicate_user',
}

const emailSchema = yup
  .string()
  .required(ErrorCodes.EMAIL_REQUIRED)
  .matches(
    /^[a-zA-Z0-9.]+@[a-zA-Z0-9]+(\.[a-zA-Z]+)+$/,
    ErrorCodes.EMAIL_INVALID,
  )

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
  name: yup.string().required(ErrorCodes.NAME_REQUIRED),
})

export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required(ErrorCodes.PASSWORD_REQUIRED),
})
