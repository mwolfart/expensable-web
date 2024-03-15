import classNames from 'classnames'

type Props = {
  message: string
  severity: 'alert-info' | 'alert-success' | 'alert-error' | 'alert-warning'
}

export function Toast({ message, severity }: Props) {
  return (
    <div className="toast z-10">
      <div className={classNames('alert', severity)}>{message}</div>
    </div>
  )
}
