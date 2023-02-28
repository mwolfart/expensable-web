import { ChangeEventHandler, InputHTMLAttributes, useState } from 'react'

type Props = {
  value?: string
} & InputHTMLAttributes<HTMLInputElement>

export function CurrencyInput({ value, onChange, ...props }: Props) {
  const [innerValue, setInnerValue] = useState(value || '')

  const innerChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const numeric = evt.target.value.replace(/[^0-9]/g, '')
    const multiplied = numeric ? parseFloat(numeric) / 100 : 0
    const formatted = `$${multiplied.toFixed(2)}`
    setInnerValue(formatted)
    if (onChange) {
      const newEvent = Object.assign({}, evt, {
        target: {
          ...evt.target,
          value: formatted,
        },
      })
      onChange(newEvent)
    }
  }

  return <input value={innerValue} onChange={innerChange} {...props} />
}
