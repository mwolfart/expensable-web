import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useState,
} from 'react'

export const DialogContext = createContext({
  openDialog: (_children: ReactNode) => {},
  closeDialog: () => {},
})

export const DialogProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setOpen] = useState(false)
  const [content, setContent] = useState<ReactNode>()

  const openDialog = (dialogContent: ReactNode) => {
    setContent(dialogContent)
    setOpen(true)
  }

  const closeDialog = () => setOpen(false)

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {isOpen && (
        <div className="fixed inset-0 z-10">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative flex h-screen">
            <div className="m-auto h-1/2 w-1/2 rounded-2xl bg-foreground">
              {content}
            </div>
          </div>
        </div>
      )}
      {children}
    </DialogContext.Provider>
  )
}
