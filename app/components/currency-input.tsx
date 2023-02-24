import { ChangeEventHandler, InputHTMLAttributes, useState } from 'react'

type Props = {
  value?: string
} & InputHTMLAttributes<HTMLInputElement>

export function CurrencyInput({ value, onChange, ...props }: Props) {
  const [innerValue, setInnerValue] = useState(value)

  const innerChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const formattedValue = evt.target.value.replace(/[^0-9.]/g, '')
    setInnerValue(formattedValue)
    if (onChange) {
      const newEvent = Object.assign({}, evt, {
        target: {
          ...evt.target,
          value: formattedValue,
        },
      })
      onChange(newEvent)
    }
  }

  const formatCurrency = (value?: string) => {
    if (value) {
      return `$${parseFloat(value).toFixed(2)}`
    }
  }

  return (
    <input
      value={formatCurrency(innerValue)}
      onChange={innerChange}
      {...props}
    />
  )
}
