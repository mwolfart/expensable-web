import type { App, ServiceAccount } from 'firebase-admin/app'
import type { Auth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import invariant from 'tiny-invariant'

let app: App
let auth: Auth

invariant(process.env.FIREBASE_ADMINSDK, 'FIREBASE_ADMINSDK must be set')
const sdk = JSON.parse(process.env.FIREBASE_ADMINSDK as string)

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
