import cx from 'classnames'
import { BiFilterAlt } from 'react-icons/bi'
import { useTranslation } from 'react-i18next'

type Props = {
  onClick: () => unknown
  isFilterApplied: boolean
}

export function FilterButton({ onClick, isFilterApplied }: Props) {
  const { t } = useTranslation()
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
