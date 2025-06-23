// Alternative: Client-side email using EmailJS (Completely FREE)
// This runs in the browser and sends emails directly through EmailJS

interface EmailJSData {
  to: string
  studentName: string
  studentId: string
  programme: string
  programLevel: string
  amountPaid: number
  registrationDate: string
  collectedBy: string
}

export const sendEmailViaEmailJS = async (emailData: EmailJSData): Promise<void> => {
  try {
    // You need to:
    // 1. Sign up at emailjs.com (FREE)
    // 2. Create an email service (Gmail, Outlook, etc.)
    // 3. Create an email template
    // 4. Get your Public Key, Service ID, and Template ID
    // 5. Add these to your environment variables:
    //    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
    //    NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
    //    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id

    const { default: emailjs } = await import("@emailjs/browser")

    const templateParams = {
      to_email: emailData.to,
      student_name: emailData.studentName,
      student_id: emailData.studentId,
      programme: emailData.programme,
      program_level: emailData.programLevel,
      amount_paid: emailData.amountPaid.toFixed(2),
      registration_date: emailData.registrationDate,
      collected_by: emailData.collectedBy,
      chatbot_link: "https://atu-cps-chatbot.vercel.app",
    }

    const result = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
    )

    if (result.status === 200) {
      console.log("✅ Email sent successfully via EmailJS")
    } else {
      throw new Error("EmailJS failed to send email")
    }
  } catch (error: any) {
    console.error("EmailJS Error:", error)
    throw new Error(error.message || "Failed to send email via EmailJS")
  }
}
