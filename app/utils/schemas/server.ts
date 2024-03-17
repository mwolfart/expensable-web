import { ErrorCodes } from '../enum'
import { isDateValid, isFixedExpenseAmountPerMonthValid } from '../helpers'
import * as yup from 'yup'

const MAX_INSTALLMENTS = 36

export const expenseSchema = yup.object().shape({
  id: yup.string(),
  name: yup.string().required(ErrorCodes.NAME_REQUIRED),
  amount: yup
    .string()
    .matches(/^\d+(\.\d+)?$/, ErrorCodes.AMOUNT_INVALID)
    .required(ErrorCodes.AMOUNT_REQUIRED),
  unit: yup.string().matches(/^(\d+(\.\d+)?)?$/),
  date: yup
    .string()
    .test('is-date-valid', ErrorCodes.BAD_DATE_FORMAT, isDateValid)
    .required(ErrorCodes.DATE_REQUIRED),
  installments: yup
    .string()
    .matches(/^\d$/)
    .test(
      'is-less-than-max',
      ErrorCodes.TOO_MANY_INSTALLMENTS,
      (v?: string) => parseInt(v || '1') <= MAX_INSTALLMENTS,
    )
    .required(ErrorCodes.INSTALLMENTS_REQUIRED),
  categories: yup.string(),
})

export const transactionSchema = yup.object().shape({
  id: yup.string(),
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
  id: yup.string(),
  title: yup.string().required(),
  startDate: yup
    .string()
    .test('is-date-valid', ErrorCodes.BAD_DATE_FORMAT, isDateValid)
    .required(ErrorCodes.DATE_REQUIRED),
  varyingCosts: yup
    .string()
    .oneOf(['1', '0'], ErrorCodes.CHANGE_VALUES_INVALID),
  amount: yup.string().when('varyingCosts', {
    is: '0',
    then: (schema) =>
      schema
        .matches(/^\d+(\.\d+)?$/, ErrorCodes.AMOUNT_INVALID)
        .required(ErrorCodes.AMOUNT_REQUIRED),
  }),
  amountPerMonth: yup.string().when('varyingCosts', {
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
