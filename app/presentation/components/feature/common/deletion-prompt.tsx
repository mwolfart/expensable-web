import { useTranslations } from 'use-intl'

type Props = {
  onConfirm: () => void
  onCancel: () => void
}

export function DeletionPrompt({ onConfirm, onCancel }: Props) {
  const t = useTranslations()
  return (
    <div className="flex flex-col items-center gap-8">
      <h3>{t('common.confirm-deletion')}</h3>
      <p className="text-center flex-grow h-[175px]">
        {t('common.confirm-deletion-text')}
      </p>
      <div className="flex gap-4 justify-center">
        <button type="button" className="btn btn-outlined" onClick={onConfirm}>
          {t('common.delete')}
        </button>
        <button type="button" className="btn btn-primary" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
