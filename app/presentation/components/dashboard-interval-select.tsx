import type { ChangeEventHandler } from 'react'
import { getMonthName } from '~/utils/helpers'

type Props = {
  onChangeInterval: (month: number, year: number) => void
  year?: number
  month?: number
}

const MIN_YEAR = 2003
const MAX_YEAR = 2053

export function DashboardIntervalSelect({
  onChangeInterval,
  year,
  month,
}: Props) {
  const currentDate = new Date()
  const hasDate = year && typeof month === 'number'
  if (hasDate) {
    currentDate.setFullYear(year, month)
  }

  const onChange: ChangeEventHandler<HTMLSelectElement> = (evt) => {
    const newDate = hasDate ? new Date(year, month) : new Date()
    const shift = parseInt(evt.target.value)
    newDate.setMonth(newDate.getMonth() + shift)
    onChangeInterval(newDate.getMonth(), newDate.getFullYear())
  }

  return (
    <select className="input" onChange={onChange} value={0}>
      {[...Array(7).keys()].map((i) => {
        const id = i - 3
        const date = hasDate ? new Date(year, month) : new Date()
        date.setMonth(date.getMonth() + id)
        if (date.getFullYear() >= MIN_YEAR && date.getFullYear() <= MAX_YEAR) {
          return (
            <option key={id} value={id}>
              {`${getMonthName(date.getMonth())} ${date.getFullYear()}`}
            </option>
          )
        }
        return null
      })}
    </select>
  )
}
