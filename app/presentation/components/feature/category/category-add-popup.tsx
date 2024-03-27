import type { ChangeEvent } from 'react'
import type { FetcherResponse } from '~/utils/types'
import { useFetcher } from '@remix-run/react'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useErrorMessages } from '~/presentation/hooks'
import {
  cxFormInput,
  cxWithDelayedFade,
  cxWithGrowMd,
  onEnter,
} from '~/utils/helpers'
import { ToastContext, ToastType } from '../../../providers/toast'

type Props = {
  isOpen: boolean
  setOpen: (value: boolean) => void
}

export function AddCategoryPopup({ isOpen, setOpen }: Props) {
  const { t } = useTranslation()
  const fetcher = useFetcher<FetcherResponse>()
  const { errorToString } = useErrorMessages()

  const { showToast } = useContext(ToastContext)

  const [hasSubmitted, setSubmitted] = useState(false)
  const [title, setTitle] = useState('')
  const [addError, setAddError] = useState<string>()

  useEffect(() => {
    const handleAction = async () => {
      if (!hasSubmitted) {
        return
      }
      if (fetcher.data?.error) {
        setAddError(errorToString(fetcher.data.error))
        setTitle('')
      } else if (fetcher.data?.success) {
        setOpen(false)
        setTitle('')
        showToast(ToastType.SUCCESS, t('category.category-added'))
      }
      setSubmitted(false)
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
    setSubmitted(true)
    fetcher.submit({ category: title }, { method: 'post' })
  }

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
      <div className={addCategoryInner}>
        <input
          className={cxFormInput({ hasError: addError })}
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
