"use client"

import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChange } from "@/lib/auth"
import { db } from "@/lib/firebase"

export interface AuthUser {
  uid: string
  email: string
  name: string
  role: "president" | "financial_officer" | "executive"
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          // Get admin details from Firestore
          const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid))

          if (adminDoc.exists()) {
            const adminData = adminDoc.data()
            setUser({
              uid: firebaseUser.uid,
              email: adminData.email,
              name: adminData.name,
              role: adminData.role,
            })
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error("Error fetching admin data:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}
