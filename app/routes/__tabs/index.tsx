import { json, LoaderArgs } from '@remix-run/server-runtime'

export async function loader({ request }: LoaderArgs) {
  // const userId = await getUserId(request)
  // if (!userId) return redirect('/login')
  // const user = await getUser(request)
  return json({})
}

export default function Dashboard() {
  return <>Dashboard</>
}
