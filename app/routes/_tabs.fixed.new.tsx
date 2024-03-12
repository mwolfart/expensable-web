import { useNavigate } from '@remix-run/react'
import { UpsertFixedExpenseForm } from '~/presentation/components/fixed-expense-upsert-form'

export default function FixedExpenseNew() {
  const navigate = useNavigate()
  const onGoBack = () => {
    navigate('/fixed')
  }
  return (
    <div className="px-8">
      <UpsertFixedExpenseForm onGoBack={onGoBack} />
    </div>
  )
}
