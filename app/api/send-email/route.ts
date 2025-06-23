import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const emailData = await request.json()
    const { to, studentName, studentId, programme, programLevel, amountPaid, registrationDate, collectedBy } = emailData

    // Email HTML template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation - COMPSSA</title>
  <style>
      body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
      }
      .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #16a34a;
      }
      .logo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
      }
      .title {
          color: #15803d;
          font-size: 28px;
          font-weight: bold;
          margin: 0;
      }
      .subtitle {
          color: #64748b;
          font-size: 16px;
          margin: 5px 0 0 0;
      }
      .congratulations {
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
      }
      .congratulations h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
      }
      .congratulations p {
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
      }
      .details-card {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
      }
      .details-title {
          color: #15803d;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
      }
      .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
      }
      .detail-item {
          display: flex;
          flex-direction: column;
      }
      .detail-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
      }
      .detail-value {
          font-size: 14px;
          color: #1e293b;
          font-weight: 500;
      }
      .chatbot-section {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          padding: 25px;
          border-radius: 8px;
          text-align: center;
          margin: 25px 0;
      }
      .chatbot-section h3 {
          margin: 0 0 10px 0;
          font-size: 20px;
      }
      .chatbot-section p {
          margin: 0 0 20px 0;
          opacity: 0.9;
      }
      .chatbot-button {
          display: inline-block;
          background: #eab308;
          color: #1f2937;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: transform 0.2s;
      }
      .chatbot-button:hover {
          transform: translateY(-2px);
      }
      .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
      }
      .welcome-message {
          background: #f0fdf4;
          border-left: 4px solid #16a34a;
          padding: 20px;
          margin: 20px 0;
      }
      .welcome-message h3 {
          color: #15803d;
          margin: 0 0 10px 0;
      }
      .welcome-message p {
          margin: 0;
          color: #475569;
      }
      @media (max-width: 600px) {
          .details-grid {
              grid-template-columns: 1fr;
          }
          .container {
              padding: 20px;
          }
      }
  </style>
</head>
<body>
  <div class="container">
      <div class="header">
          <div class="logo">
              <img src="https://compssa-registration-portal.vercel.app/compssa-logo.png" alt="COMPSSA Logo" style="width: 100px; height: 100px; border-radius: 50%; object-fit: contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width: 100px; height: 100px; border: 2px solid #16a34a; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #16a34a; font-size: 24px; font-weight: bold;\\'>CPS</div>';">
          </div>
          <h1 class="title">COMPSSA</h1>
          <p class="subtitle">Computer Science Department Registration</p>
      </div>

      <div class="congratulations">
          <h2>🎉 Congratulations!</h2>
          <p>Your registration has been successfully completed</p>
      </div>

      <div class="welcome-message">
          <h3>Welcome to the Computer Science Family!</h3>
          <p>Dear ${studentName}, we are thrilled to welcome you to the Computer Science Department. You have taken an important step towards an exciting career in technology and innovation. We look forward to supporting you throughout your academic journey!</p>
      </div>

      <div class="details-card">
          <div class="details-title">
              📋 Registration Details
          </div>
          <div class="details-grid">
              <div class="detail-item">
                  <span class="detail-label">Student Name</span>
                  <span class="detail-value">${studentName}</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Student ID</span>
                  <span class="detail-value">${studentId}</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Programme</span>
                  <span class="detail-value">${programme}</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Program Level</span>
                  <span class="detail-value">${programLevel}</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Registration Fee</span>
                  <span class="detail-value">GHS ${amountPaid.toFixed(2)}</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Registration Date</span>
                  <span class="detail-value">${registrationDate}</span>
              </div>
              <div class="detail-item">
                  <span class="detail-label">Processed By</span>
                  <span class="detail-value">${collectedBy}</span>
              </div>
          </div>
      </div>

      <div class="chatbot-section">
          <h3>🤖 Need Help? Ask Our Chatbot!</h3>
          <p>Have questions about the department, courses, or campus life? Our intelligent chatbot is here to help you 24/7!</p>
          <a href="https://atu-cps-chatbot.vercel.app" class="chatbot-button" target="_blank">
              Chat with ATU CPS Bot
          </a>
      </div>

      <div class="welcome-message">
          <h3>What's Next?</h3>
          <p>
              • Keep this email for your records<br>
              • Check your student portal regularly for updates<br>
              • Join our department's social media groups<br>
              • Attend orientation sessions when announced<br>
              • Use our chatbot for any questions you may have
          </p>
      </div>

      <div class="footer">
          <p><strong>Computer Science Department</strong><br>
          Accra Technical University<br>
          Email: info@compssa.edu | Phone: +233 XXX XXX XXX</p>
          <p style="margin-top: 15px; font-size: 12px;">
              This is an automated email. Please do not reply to this message.<br>
              If you need assistance, please use our chatbot or contact the department directly.
          </p>
      </div>
  </div>
</body>
</html>
  `

    // Email text version (fallback)
    const emailText = `
COMPSSA - Registration Confirmation

Congratulations ${studentName}!

Your registration has been successfully completed for the Computer Science Department.

Registration Details:
- Student Name: ${studentName}
- Student ID: ${studentId}
- Programme: ${programme}
- Program Level: ${programLevel}
- Registration Fee: GHS ${amountPaid.toFixed(2)}
- Registration Date: ${registrationDate}
- Processed By: ${collectedBy}

Welcome to the Computer Science Family!

We are thrilled to welcome you to the Computer Science Department. You have taken an important step towards an exciting career in technology and innovation.

Need Help? Use Our Chatbot!
Have questions about the department, courses, or campus life? Visit our chatbot at: https://atu-cps-chatbot.vercel.app

What's Next?
• Keep this email for your records
• Check your student portal regularly for updates
• Join our department's social media groups
• Attend orientation sessions when announced
• Use our chatbot for any questions you may have

Computer Science Department
Accra Technical University
Email: info@compssa.edu | Phone: +233 XXX XXX XXX

This is an automated email. Please do not reply to this message.
  `

    // Gmail with App Password - PRIMARY METHOD (FREE)
    if (process.env.NEXT_PUBLIC_GMAIL_USER && process.env.NEXT_PUBLIC_GMAIL_APP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.NEXT_PUBLIC_GMAIL_USER,
            pass: process.env.NEXT_PUBLIC_GMAIL_APP_PASSWORD, // 16-character app password
          },
        })

        // Verify connection before sending
        await transporter.verify()

        const mailOptions = {
          from: `"COMPSSA Registration Portal" <${process.env.NEXT_PUBLIC_GMAIL_USER}>`,
          to: to,
          subject: `🎉 Welcome to COMPSSA - Registration Confirmed for ${studentName}`,
          html: emailHtml,
          text: emailText,
          replyTo: process.env.NEXT_PUBLIC_GMAIL_USER,
        }

        const info = await transporter.sendMail(mailOptions)

        console.log("✅ Email sent successfully via Gmail to:", to)
        console.log("📧 Message ID:", info.messageId)

        return NextResponse.json({
          success: true,
          message: "Registration email sent successfully via Gmail",
          emailSent: true,
          messageId: info.messageId,
        })
      } catch (gmailError: any) {
        console.error("❌ Gmail Error:", gmailError.message)

        // Provide specific error messages for common issues
        let errorMessage = "Failed to send email via Gmail"

        if (gmailError.message.includes("Invalid login")) {
          errorMessage = "Gmail authentication failed. Please check your app password."
        } else if (gmailError.message.includes("Less secure app")) {
          errorMessage = "Please use an App Password instead of your regular Gmail password."
        } else if (gmailError.message.includes("Daily sending quota")) {
          errorMessage = "Gmail daily sending limit reached. Please try again tomorrow."
        }

        return NextResponse.json(
          {
            success: false,
            message: errorMessage,
            emailSent: false,
            error: gmailError.message,
          },
          { status: 500 },
        )
      }
    }

    // If Gmail is not configured
    console.log("⚠️ Gmail not configured. Please check environment variables.")
    console.log("GMAIL_USER:", process.env.NEXT_PUBLIC_GMAIL_USER ? "✅ Set" : "❌ Missing")
    console.log("GMAIL_APP_PASSWORD:", process.env.NEXT_PUBLIC_GMAIL_APP_PASSWORD ? "✅ Set" : "❌ Missing")

    return NextResponse.json(
      {
        success: false,
        message:
          "Gmail not configured. Please check NEXT_PUBLIC_GMAIL_USER and NEXT_PUBLIC_GMAIL_APP_PASSWORD environment variables.",
        emailSent: false,
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error("Email API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to send email",
        emailSent: false,
      },
      { status: 500 },
    )
  }
}
