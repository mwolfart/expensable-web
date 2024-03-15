import type { FC, PropsWithChildren } from 'react'
import { createContext, useState, useCallback } from 'react'
import { Toast } from '../components/layout/toast'
import { timeout } from '~/utils/helpers'

export enum ToastType {
  SUCCESS = 'alert-success',
  ERROR = 'alert-error',
  INFO = 'alert-info',
  WARNING = 'alert-warning',
}

export const ToastContext = createContext({
  showToast: (_toastType: ToastType, _toastMessage: string) => {},
})

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [openToasts, setOpenToasts] = useState<
    { type: ToastType; message: string }[]
  >([])

  const showToast = useCallback(
    async (toastType: ToastType, toastMessage: string) => {
      setOpenToasts([...openToasts, { type: toastType, message: toastMessage }])
      await timeout(3000)
      setOpenToasts(openToasts.slice(1))
    },
    [openToasts],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {openToasts.map(({ message, type }, i) => (
        <Toast key={i} message={message} severity={type} />
      ))}
      {children}
    </ToastContext.Provider>
  )
}
