import cx from 'classnames'

export const withFade = (baseClasses: string, active?: boolean) => {
  return cx(
    baseClasses,
    !active && 'pointer-events-none opacity-0',
    active && 'opacity-100',
  )
}
