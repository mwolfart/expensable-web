import cx from 'classnames'

export const cxWithFade = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition`,
    !active && 'pointer-events-none opacity-0',
    active && 'opacity-100',
  )
}

export const cxWithGrowFadeMd = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition-height-fade duration-300`,
    !active && 'max-h-0 opacity-0 invisible',
    active && 'max-h-64 opacity-1 visible',
  )
}

export const cxWithGrowMd = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition-height duration-700`,
    !active && 'max-h-0 delay-200',
    active && 'max-h-64 delay-0',
  )
}

export const cxWithGrowFadeLg = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition-height-fade duration-700`,
    !active && 'max-h-0 opacity-0 invisible',
    active && 'max-h-96 opacity-1 visible',
  )
}

export const cxWithDelayedFade = (baseClasses: string, active?: boolean) => {
  return cx(
    `${baseClasses} transition duration-500`,
    !active && 'pointer-events-none opacity-0 delay-0',
    active && 'opacity-100 delay-200',
  )
}

export const cxFormInput = ({
  hasError,
  extraClasses,
}: {
  hasError?: unknown
  extraClasses?: string
}) => {
  return cx(
    'input w-full bg-white',
    Boolean(hasError) && 'border-error placeholder-error',
    extraClasses,
  )
}
