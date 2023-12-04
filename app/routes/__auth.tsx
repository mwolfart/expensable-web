import type { LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import { getLoggedUserId } from '~/infra/session.server'
import { useState } from 'react'
import cx from 'classnames'
import { timeout } from '~/utils/timeout'
import { Outlet } from '@remix-run/react'

export type AuthContext = [transition: () => Promise<void>]

export async function loader({ request }: LoaderArgs) {
  const userId = await getLoggedUserId(request)
  if (userId) {
    return redirect('/')
  }
  return json({})
}

export default function AuthPage() {
  const [isTransitioning, setTransitioning] = useState(false)

  const transition = async () => {
    setTransitioning(true)
    await timeout(300)
    setTransitioning(false)
  }

  const context: AuthContext = [transition]

  const panelClasses = cx(
    'w-full rounded-xl bg-foreground p-8 md:w-1/2 xl:w-1/3 transition duration-300',
    isTransitioning && 'translate-x-[-600px]',
  )

  return (
    <div className="flex h-full flex-grow items-center p-8 sm:p-16">
      <div className={panelClasses}>
        <Outlet context={context} />
      </div>
    </div>
  )
}
