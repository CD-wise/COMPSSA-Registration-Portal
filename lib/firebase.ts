import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAbg3zC18VWvgoJMOVc33lYMAK3NcJ4rX8",
  authDomain: "compssa-register.firebaseapp.com",
  projectId: "compssa-register",
  storageBucket: "compssa-register.firebasestorage.app",
  messagingSenderId: "160471615333",
  appId: "1:160471615333:web:fcba7330289722fcce838c",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
