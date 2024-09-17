import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Configuration Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyA1J1GAcdqh3hknwChzJK0MTc_CUSVvKIc',
  authDomain: 'buvetteust.firebaseapp.com',
  projectId: 'buvetteust',
  storageBucket: 'buvetteust.appspot.com',
  messagingSenderId: '880085927172',
  appId: '1:880085927172:web:54e3a66dc001449c7dfc51',
  measurementId: 'G-NEB83J7BZ1'
}

// Initialise Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Initialise Firestore
const db = getFirestore(firebaseApp)

export { db }
