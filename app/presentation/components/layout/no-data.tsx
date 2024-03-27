import type { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { FaMoneyCheck } from 'react-icons/fa'

export function NoData({ children }: PropsWithChildren) {
  const { t } = useTranslation()
  return (
    <div className="flex-grow flex flex-col rounded-xl border border-primary">
      <div className="m-auto flex h-full flex-col items-center justify-center gap-4 p-8 text-center text-primary">
        <FaMoneyCheck size={128} className="-my-4" />
        <h2>{t('common.nothing-to-see')}</h2>
        {children}
      </div>
    </div>
  )
}
