import { initializeApp } from 'firebase/app'
import { getAuth, inMemoryPersistence, setPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCgF9rj4PmYq3EHDHe9jtZ_Y7WnuRcjvkw',
  authDomain: 'expensable-20ce7.firebaseapp.com',
  projectId: 'expensable-20ce7',
  storageBucket: 'expensable-20ce7.appspot.com',
  messagingSenderId: '589801774189',
  appId: '1:589801774189:web:c9827f85f924bf5e15b364',
  measurementId: 'G-5C8LWT949F',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
setPersistence(auth, inMemoryPersistence)
export { auth as clientAuth }
