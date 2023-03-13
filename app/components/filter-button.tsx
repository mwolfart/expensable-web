import cx from 'classnames'
import { BiFilterAlt } from 'react-icons/bi'
import { useTranslations } from 'use-intl'

type Props = {
  onClick: () => unknown
  isFilterApplied: boolean
}

export function FilterButton({ onClick, isFilterApplied }: Props) {
  const t = useTranslations()
  const cxFilterButton = cx(
    'btn-primary btn transition',
    !isFilterApplied && 'btn-outline',
  )

  return (
    <button
      className={cxFilterButton}
      aria-label={t('common.filters')}
      onClick={onClick}
    >
      <BiFilterAlt size={24} />
    </button>
  )
}
