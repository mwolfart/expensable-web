import type { App, ServiceAccount } from 'firebase-admin/app'
import type { Auth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import sdk from '../expensable-firebase-adminsdk.json'

let app: App
let auth: Auth

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(sdk as ServiceAccount),
  })
  auth = getAuth(app)
} else {
  app = getApp()
  auth = getAuth(app)
}

export { auth as serverAuth }
