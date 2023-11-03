import type { LoaderArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'

export async function loader({ request }: LoaderArgs) {
  // const userId = await getUserId(request)
  // if (!userId) return redirect('/login')
  // const user = await getUser(request)
  return json({})
}

export default function Dashboard() {
  // Transactions in the current month
  // Transactions in the past month
  // Category with the most amount in current month
  // Category with the most amount in last month
  return <>Dashboard</>
}
