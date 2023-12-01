import { useNavigate } from '@remix-run/react'
import { useEffect } from 'react'

export default function Index() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/dashboard')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div />
}
