import { redirect } from '@remix-run/node'

import { logout } from '~/infra/session.server'

export async function action() {
  return logout()
}

export async function loader() {
  return redirect('/')
}
