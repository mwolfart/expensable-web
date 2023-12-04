import type { KeyboardEvent } from 'react'

export const onEnter = (
  evt: KeyboardEvent<HTMLInputElement>,
  callback: () => unknown,
) => {
  if (evt.key === 'Enter') {
    callback()
  }
}
