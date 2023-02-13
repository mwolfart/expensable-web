import cx from 'classnames'

export const cxWithFade = (baseClasses: string, active?: boolean) => {
  return cx(
    baseClasses,
    !active && 'pointer-events-none opacity-0',
    active && 'opacity-100',
  )
}

export const cxFormInput = ({
  hasError,
  extraClasses,
}: {
  hasError?: boolean
  extraClasses?: string
}) => {
  return cx(
    'input w-full bg-white',
    hasError && 'border-error placeholder-error',
    extraClasses,
  )
}

export const getYupErrors = (yupError: any) => {
  const errorArray = yupError.inner.map(
    ({ path, errors: [code] }: any): { path: string; code: string } => ({
      path,
      code,
    }),
  ) as Array<{ path: string; code: string }>
  const errors = errorArray
    .reverse()
    .reduce((acc, { path, code }) => ({ ...acc, [path]: code }), {})
  return errors
}
