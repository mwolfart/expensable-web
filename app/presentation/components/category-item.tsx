import type { Category } from '@prisma/client'
import type { FetcherResponse } from '~/utils/types'
import type { KeyboardEventHandler } from 'react'
import { useFetcher } from '@remix-run/react'
import { useContext, useEffect, useState } from 'react'
import { BsTrash } from 'react-icons/bs'
import { MdOutlineEdit } from 'react-icons/md'
import { useTranslations } from 'use-intl'
import { cxFormInput } from '~/utils/helpers'
import { ToastContext, ToastType } from '../providers/toast'

type Props = {
  category: Category
}

export function CategoryItem({ category }: Props) {
  const t = useTranslations()
  const fetcher = useFetcher<FetcherResponse>()

  const { showToast } = useContext(ToastContext)

  const [isEditing, setEditing] = useState(false)
  const [value, setValue] = useState(category.title)
  const [hasUpdateError, setUpdateError] = useState('')

  useEffect(() => {
    const handleAction = async () => {
      if (fetcher.data?.method === 'DELETE') {
        showToast(ToastType.SUCCESS, t('category.category-deleted'))
      } else if (fetcher.data?.method === 'PATCH') {
        if (fetcher.data.error) {
          setUpdateError(fetcher.data.error)
        } else {
          setUpdateError('')
          setEditing(false)
        }
      }
    }
    handleAction()
  }, [fetcher.data])

  const onEdit = () => {
    setEditing(true)
  }

  const onDelete = () =>
    fetcher.submit({ id: category.id }, { method: 'delete' })

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    const { key } = event
    if (key === 'Enter') {
      fetcher.submit(
        { id: category.id, title: value },
        { action: 'categories', method: 'patch' },
      )
    } else if (key === 'Escape') {
      setValue(category.title)
      setUpdateError('')
      setEditing(false)
    }
  }

  return (
    <div className="flex items-center gap-2 bg-foreground py-2">
      {isEditing ? (
        <input
          className={cxFormInput({ hasError: hasUpdateError })}
          value={value}
          onKeyDown={onKeyDown}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <p className="flex-grow">{category.title}</p>
      )}
      <button
        className="btn-ghost btn p-2 text-primary"
        aria-label={t('common.rename')}
        onClick={onEdit}
      >
        <MdOutlineEdit size={20} />
      </button>
      <button
        className="btn-ghost btn p-2 text-primary"
        aria-label={t('common.delete')}
        onClick={onDelete}
      >
        <BsTrash size={20} />
      </button>
    </div>
  )
}
