import type { FC, PropsWithChildren, ReactNode } from 'react'
import { useCallback } from 'react'
import { createContext, useState } from 'react'
import cx from 'classnames'

export const DialogContext = createContext({
  openDialog: (_children: ReactNode, _isLarge?: boolean) => {},
  closeDialog: () => {},
})

export const DialogProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setOpen] = useState(false)
  const [isLarge, setLarge] = useState(false)
  const [content, setContent] = useState<ReactNode>()

  const openDialog = useCallback(
    (dialogContent: ReactNode, isLarge?: boolean) => {
      setOpen(true)
      setLarge(!!isLarge)
      setContent(dialogContent)
    },
    [],
  )

  const closeDialog = useCallback(() => setOpen(false), [])

  const cxContentWrapper = cx(
    isLarge && 'md:min-h-2/3 md:max-h-5/6 md:w-3/4',
    !isLarge && 'md:min-h-1/2 md:max-h-3/4 md:w-1/2',
    `w-full bg-foreground md:m-auto md:rounded-2xl`,
  )

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {isOpen && (
        <div className="fixed inset-0 z-10">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative flex h-screen">
            <div className={cxContentWrapper}>{content}</div>
          </div>
        </div>
      )}
      {children}
    </DialogContext.Provider>
  )
}
