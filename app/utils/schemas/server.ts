import { ErrorCodes } from '../enum'
import { isDateValid, isFixedExpenseAmountPerMonthValid } from '../helpers'
import * as yup from 'yup'

export const fixedExpenseSchema = yup.object().shape({
  id: yup.string(),
  title: yup.string().required(),
  startDate: yup
    .string()
    .test('is-date-valid', ErrorCodes.BAD_DATE_FORMAT, isDateValid)
    .required(),
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
