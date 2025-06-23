"use client"

import { useState, useEffect, useRef } from "react"
import { subscribeToRegistrations, type Student } from "@/lib/firestore"

export const useRegistrations = (filters?: {
  programme?: string
  status?: string
  limit?: number
}) => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Clean up previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    // Apply default limit to reduce reads
    const optimizedFilters = {
      ...filtersRef.current,
      limit: filtersRef.current?.limit || 50, // Default limit of 50 to reduce reads
    }

    const unsubscribe = subscribeToRegistrations((data) => {
      setStudents(data)
      setLoading(false)
    }, optimizedFilters)

    unsubscribeRef.current = unsubscribe

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [filtersRef.current?.programme, filtersRef.current?.status, filtersRef.current?.limit])

  return { students, loading, error }
}
