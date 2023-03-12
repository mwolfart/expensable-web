import type { ReactNode } from 'react'
import { useTranslations } from 'use-intl'

type Props = {
  content: ReactNode
  onClose: () => unknown
}

export function MobileCancelDialog({ content, onClose }: Props) {
  const t = useTranslations()
  return (
    <div className="fixed inset-0 flex flex-col justify-center gap-4 bg-foreground p-16 sm:px-24 md:hidden">
      {content}
      <button className="btn-outline btn-primary btn" onClick={onClose}>
        {t('common.cancel')}
      </button>
    </div>
  )
}
