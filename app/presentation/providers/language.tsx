import type { ReactNode } from 'react'
import { createContext } from 'react'

type LanguageContextProps = {
  setLanguage: (lang: string) => void
}

const defaultContext: LanguageContextProps = {
  setLanguage: () => {},
}

const LanguageContext = createContext(defaultContext)

type Props = {
  context: LanguageContextProps
  children: ReactNode
}

const LanguageProvider = ({ context, children }: Props) => {
  return (
    <LanguageContext.Provider value={context}>
      {children}
    </LanguageContext.Provider>
  )
}

export { LanguageProvider, LanguageContext }
