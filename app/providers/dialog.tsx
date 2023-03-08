import { FC, PropsWithChildren, ReactNode, useCallback, useMemo } from 'react'
import { createContext, useState } from 'react'

export const DialogContext = createContext({
  openDialog: (_children: ReactNode) => {},
  closeDialog: () => {},
})

export const DialogProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setOpen] = useState(false)
  const [content, setContent] = useState<ReactNode>()

  const openDialog = useCallback((dialogContent: ReactNode) => {
    setOpen(true)
    setContent(dialogContent)
  }, [])

  const closeDialog = useCallback(() => setOpen(false), [])

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {isOpen && (
        <div className="fixed inset-0 z-10">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative flex h-screen">
            <div className="md:min-h-1/2 md:max-h-3/4 w-full bg-foreground md:m-auto md:w-1/2 md:rounded-2xl">
              {content}
            </div>
          </div>
        </div>
      )}
      {children}
    </DialogContext.Provider>
  )
}
