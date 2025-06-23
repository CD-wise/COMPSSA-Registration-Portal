import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  startAfter,
  type Timestamp,
  type DocumentSnapshot,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Student {
  id?: string
  fullName: string
  studentId: string
  email: string
  programme: string
  programLevel: string
  sex: string
  phone: string
  paymentMethod: string
  amountPaid: number
  souvenirs: string[]
  collectedBy: string
  collectedByUid: string
  timestamp: Timestamp | Date
  financialValidation?: {
    status: "pending" | "validated" | "disputed"
    updatedBy?: string
    updatedAt?: Timestamp
    notes?: string
  }
}

export interface RegistrationData {
  fullName: string
  studentId: string
  email: string
  programme: string
  programLevel: string
  sex: string
  phone: string
  paymentMethod: string
  amountPaid: number
  souvenirs: string[]
  collectedBy: string
  collectedByUid: string
}

// Add a new student registration
export const addStudentRegistration = async (data: RegistrationData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "registrations"), {
      ...data,
      timestamp: serverTimestamp(),
      financialValidation: {
        status: "pending",
      },
    })
    return docRef.id
  } catch (error: any) {
    throw new Error(error.message || "Failed to add registration")
  }
}

// Optimized real-time subscription with better query limits
export const subscribeToRegistrations = (
  callback: (students: Student[]) => void,
  filters?: {
    programme?: string
    status?: string
    limit?: number
    userId?: string // For filtering user's own registrations
  },
) => {
  // Build query with optimizations
  let q = query(
    collection(db, "registrations"),
    orderBy("timestamp", "desc"),
    limit(filters?.limit || 50), // Default limit to reduce reads
  )

  // Add filters
  if (filters?.programme && filters.programme !== "all") {
    q = query(q, where("programme", "==", filters.programme))
  }

  if (filters?.status && filters.status !== "all") {
    q = query(q, where("financialValidation.status", "==", filters.status))
  }

  // Filter by user's own registrations to reduce reads for regular users
  if (filters?.userId) {
    q = query(q, where("collectedByUid", "==", filters.userId))
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const students: Student[] = []
      snapshot.forEach((doc) => {
        students.push({
          id: doc.id,
          ...doc.data(),
        } as Student)
      })
      callback(students)
    },
    (error) => {
      console.error("Firestore subscription error:", error)
    },
  )
}

// Paginated query for large datasets
export const getRegistrationsPaginated = async (
  pageSize = 20,
  lastDoc?: DocumentSnapshot,
  filters?: {
    programme?: string
    status?: string
  },
): Promise<{ students: Student[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(collection(db, "registrations"), orderBy("timestamp", "desc"), limit(pageSize))

    // Add filters
    if (filters?.programme && filters.programme !== "all") {
      q = query(q, where("programme", "==", filters.programme))
    }

    if (filters?.status && filters.status !== "all") {
      q = query(q, where("financialValidation.status", "==", filters.status))
    }

    // Add pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const snapshot = await getDocs(q)
    const students: Student[] = []

    snapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data(),
      } as Student)
    })

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null

    return { students, lastDoc: newLastDoc }
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch registrations")
  }
}

// Update student registration
export const updateStudentRegistration = async (id: string, data: Partial<Student>): Promise<void> => {
  try {
    await updateDoc(doc(db, "registrations", id), data)
  } catch (error: any) {
    throw new Error(error.message || "Failed to update registration")
  }
}

// Update financial validation status
export const updateFinancialStatus = async (
  id: string,
  status: "pending" | "validated" | "disputed",
  updatedBy: string,
  notes?: string,
): Promise<void> => {
  try {
    await updateDoc(doc(db, "registrations", id), {
      "financialValidation.status": status,
      "financialValidation.updatedBy": updatedBy,
      "financialValidation.updatedAt": serverTimestamp(),
      ...(notes && { "financialValidation.notes": notes }),
    })
  } catch (error: any) {
    throw new Error(error.message || "Failed to update financial status")
  }
}

// Delete student registration
export const deleteStudentRegistration = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "registrations", id))
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete registration")
  }
}

// Optimized search with limits
export const searchStudents = async (searchTerm: string, limitResults = 20): Promise<Student[]> => {
  try {
    // Use a more efficient query with limits
    const studentsRef = query(
      collection(db, "registrations"),
      orderBy("timestamp", "desc"),
      limit(limitResults * 2), // Get a bit more to account for filtering
    )

    const snapshot = await getDocs(studentsRef)
    const students: Student[] = []

    snapshot.forEach((doc) => {
      const data = doc.data() as Student
      if (
        data.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        students.push({
          id: doc.id,
          ...data,
        })
      }
    })

    // Return only the requested limit
    return students.slice(0, limitResults)
  } catch (error: any) {
    throw new Error(error.message || "Search failed")
  }
}

// Cached statistics to reduce reads
let cachedStats: any = null
let lastStatsUpdate = 0
const STATS_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const getRegistrationStats = async (forceRefresh = false) => {
  try {
    const now = Date.now()

    // Return cached stats if still valid
    if (!forceRefresh && cachedStats && now - lastStatsUpdate < STATS_CACHE_DURATION) {
      return cachedStats
    }

    // Fetch limited data for stats calculation
    const snapshot = await getDocs(
      query(
        collection(db, "registrations"),
        orderBy("timestamp", "desc"),
        limit(1000), // Limit to reduce reads
      ),
    )

    const students: Student[] = []
    snapshot.forEach((doc) => {
      students.push(doc.data() as Student)
    })

    const stats = {
      total: students.length,
      totalAmount: students.reduce((sum, s) => sum + s.amountPaid, 0),
      validated: students.filter((s) => s.financialValidation?.status === "validated").length,
      pending: students.filter((s) => s.financialValidation?.status === "pending").length,
      disputed: students.filter((s) => s.financialValidation?.status === "disputed").length,
      byProgramme: students.reduce(
        (acc, s) => {
          acc[s.programme] = (acc[s.programme] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    // Cache the results
    cachedStats = stats
    lastStatsUpdate = now

    return stats
  } catch (error: any) {
    throw new Error(error.message || "Failed to get statistics")
  }
}
