import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: "AIzaSyCEI5VjVMpkqw1B-5w5AWwLXdmPwIo-nQU",
  authDomain: "coolcash-d0331.firebaseapp.com",
  projectId: "coolcash-d0331",
  storageBucket: "coolcash-d0331.firebasestorage.app",
  messagingSenderId: "43784821653",
  appId: "1:43784821653:web:b28a80d5ac60939874349c",
  measurementId: "G-EP56ZM0TNE",
}

const app = initializeApp(firebaseConfig)

export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  },
  'default',
)

