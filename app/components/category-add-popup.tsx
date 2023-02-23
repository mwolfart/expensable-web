import { useFetcher } from '@remix-run/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useTranslations } from 'use-intl'
import { useErrorMessages } from '~/hooks'
import { cxFormInput, cxWithDelayedFade, cxWithGrowMd, onEnter } from '~/utils'
import { timeout } from '~/utils/timeout'

type Props = {
  isOpen: boolean
  setOpen: (value: boolean) => void
}

export function AddCategoryPopup({ isOpen, setOpen }: Props) {
  const t = useTranslations()
  const fetcher = useFetcher()
  const { errorToString } = useErrorMessages()
  const [showAddToast, setShowAddToast] = useState(false)
  const [title, setTitle] = useState('')
  const [addError, setAddError] = useState<string>()

  useEffect(() => {
    const handleAction = async () => {
      if (fetcher.data?.error) {
        setAddError(errorToString(fetcher.data.error))
        setTitle('')
      } else if (fetcher.data?.success) {
        setOpen(false)
        setShowAddToast(true)
        setTitle('')
        await timeout(3000)
        setShowAddToast(false)
      }
    }
    handleAction()
  }, [fetcher.data])

  const onCancelAdd = () => {
    setTitle('')
    setOpen(false)
  }

  const onChangeNewCategory = (evt: ChangeEvent<HTMLInputElement>) => {
    setTitle(evt.target.value)
    setAddError(undefined)
  }

  const onSubmit = () => {
    fetcher.submit({ category: title }, { method: 'post' })
  }

  const AddToast = (
    <div className="toast">
      <div className="alert alert-success">{t('category.category-added')}</div>
    </div>
  )
  const addCategoryOuter = cxWithGrowMd(
    'absolute right-0 left-0 sm:left-auto top-full my-4 sm:w-80 rounded-xl bg-primary',
    isOpen,
  )
  const addCategoryInner = cxWithDelayedFade(
    'grid grid-cols-2-grow-left grid-rows-2 gap-4 p-4',
    isOpen,
  )

  return (
    <div className={addCategoryOuter}>
      {showAddToast && AddToast}
      <div className={addCategoryInner}>
        <input
          className={cxFormInput({ hasError: Boolean(addError) })}
          placeholder={addError || t('category.category-name')}
          value={title}
          onChange={onChangeNewCategory}
          onKeyDown={(evt) => onEnter(evt, onSubmit)}
        />
        <button className="btn-secondary btn p-4 text-white" onClick={onSubmit}>
          {t('common.ok')}
        </button>
        <button
          className="btn col-span-2 text-white hover:border-transparent hover:bg-white hover:text-primary"
          onClick={onCancelAdd}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
