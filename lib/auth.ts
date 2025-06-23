import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface AdminUser {
  uid: string
  email: string
  name: string
  role: "president" | "financial_officer" | "executive"
}

export const loginUser = async (email: string, password: string): Promise<AdminUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get admin details from Firestore
    const adminDoc = await getDoc(doc(db, "admins", user.uid))

    if (!adminDoc.exists()) {
      throw new Error("User not authorized as admin")
    }

    const adminData = adminDoc.data()
    return {
      uid: user.uid,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
    }
  } catch (error: any) {
    throw new Error(error.message || "Login failed")
  }
}

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message || "Logout failed")
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}
