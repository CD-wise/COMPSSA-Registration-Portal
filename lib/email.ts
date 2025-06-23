interface EmailData {
  to: string
  studentName: string
  studentId: string
  programme: string
  programLevel: string
  amountPaid: number
  registrationDate: string
  collectedBy: string
}

export const sendRegistrationEmail = async (emailData: EmailData): Promise<void> => {
  try {
    // Option 1: Server-side email (Gmail/Resend)
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const error = await response.json()

      // If server-side fails, try client-side EmailJS as fallback
      if (process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
        const { sendEmailViaEmailJS } = await import("./email-client")
        await sendEmailViaEmailJS(emailData)
        return
      }

      throw new Error(error.message || "Failed to send email")
    }
  } catch (error: any) {
    console.error("Email sending error:", error)
    throw new Error(error.message || "Failed to send registration email")
  }
}
