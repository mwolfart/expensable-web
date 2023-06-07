import { useNavigate } from '@remix-run/react'
import { UpsertTransactionForm } from '~/components/transaction-upsert-form'

export default function TransactionNew() {
  const navigate = useNavigate()
  const onGoBack = () => {
    navigate('/transactions')
  }
  return (
    <div className="px-8">
      <UpsertTransactionForm onGoBack={onGoBack} />
    </div>
  )
}
