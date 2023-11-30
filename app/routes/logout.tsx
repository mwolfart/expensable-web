import { redirect } from '@remix-run/node'

import { logout } from '~/session.server'

export async function action() {
  return logout()
}

export async function loader() {
  return redirect('/')
}
