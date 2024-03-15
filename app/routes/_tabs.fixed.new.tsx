import { useNavigate } from '@remix-run/react'
import { UpsertFixedExpenseForm } from '~/presentation/components/feature/fixed-expense/fixed-expense-upsert-form'

export default function FixedExpenseNew() {
  const navigate = useNavigate()
  const onGoBack = () => {
    navigate('/fixed-expenses')
  }
  return (
    <div className="px-8">
      <UpsertFixedExpenseForm onGoBack={onGoBack} />
    </div>
  )
}
