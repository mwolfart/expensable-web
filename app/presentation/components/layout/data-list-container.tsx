import type { PropsWithChildren } from 'react'

export function DataListContainer({ children }: PropsWithChildren) {
  return (
    <div className="m-8 mt-0 flex flex-grow flex-col gap-2 md:mt-4 md:gap-4">
      {children}
    </div>
  )
}
