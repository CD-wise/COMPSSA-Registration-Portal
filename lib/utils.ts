import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe date formatting function
export function formatDate(timestamp: any): string {
  if (!timestamp) return "N/A"

  try {
    let date: Date

    // Handle Firestore Timestamp
    if (timestamp && typeof timestamp === "object" && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    }
    // Handle regular Date object
    else if (timestamp instanceof Date) {
      date = timestamp
    }
    // Handle timestamp number
    else if (typeof timestamp === "number") {
      date = new Date(timestamp)
    }
    // Handle ISO string
    else if (typeof timestamp === "string") {
      date = new Date(timestamp)
    }
    // Handle null/undefined
    else {
      return "N/A"
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }

    // Use consistent ISO format to avoid locale differences
    return date.toLocaleDateString("en-CA") // YYYY-MM-DD format
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid Date"
  }
}

// Safe time formatting function
export function formatDateTime(timestamp: any): string {
  if (!timestamp) return "N/A"

  try {
    let date: Date

    // Handle Firestore Timestamp
    if (timestamp && typeof timestamp === "object" && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    }
    // Handle regular Date object
    else if (timestamp instanceof Date) {
      date = timestamp
    }
    // Handle timestamp number
    else if (typeof timestamp === "number") {
      date = new Date(timestamp)
    }
    // Handle ISO string
    else if (typeof timestamp === "string") {
      date = new Date(timestamp)
    }
    // Handle null/undefined
    else {
      return "N/A"
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }

    // Format with date and time
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("DateTime formatting error:", error)
    return "Invalid Date"
  }
}
