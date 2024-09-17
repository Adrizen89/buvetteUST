// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyA1J1GAcdqh3hknwChzJK0MTc_CUSVvKIc',
  authDomain: 'buvetteust.firebaseapp.com',
  projectId: 'buvetteust',
  storageBucket: 'buvetteust.appspot.com',
  messagingSenderId: '880085927172',
  appId: '1:880085927172:web:54e3a66dc001449c7dfc51',
  measurementId: 'G-NEB83J7BZ1'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
