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
  type Timestamp,
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

// Get all registrations with real-time updates
export const subscribeToRegistrations = (
  callback: (students: Student[]) => void,
  filters?: {
    programme?: string
    status?: string
    limit?: number
  },
) => {
  let q = query(collection(db, "registrations"), orderBy("timestamp", "desc"))

  if (filters?.programme) {
    q = query(q, where("programme", "==", filters.programme))
  }

  if (filters?.status) {
    q = query(q, where("financialValidation.status", "==", filters.status))
  }

  if (filters?.limit) {
    q = query(q, limit(filters.limit))
  }

  return onSnapshot(q, (snapshot) => {
    const students: Student[] = []
    snapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data(),
      } as Student)
    })
    callback(students)
  })
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

// Search students by ID or name
export const searchStudents = async (searchTerm: string): Promise<Student[]> => {
  try {
    const studentsRef = collection(db, "registrations")
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

    return students
  } catch (error: any) {
    throw new Error(error.message || "Search failed")
  }
}

// Get registration statistics
export const getRegistrationStats = async () => {
  try {
    const snapshot = await getDocs(collection(db, "registrations"))
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

    return stats
  } catch (error: any) {
    throw new Error(error.message || "Failed to get statistics")
  }
}
