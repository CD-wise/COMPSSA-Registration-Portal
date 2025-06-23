# COMPSSA Registration Portal

A modern registration portal for the Computer Science Students Association (COMPSSA) built with Next.js, Firebase, and Tailwind CSS.

## Features

- 🔐 **Admin Authentication** - Role-based access control (President, Financial Officer, Executive)
- 📝 **Student Registration** - Complete registration form with validation
- 💰 **Financial Management** - Payment tracking and validation
- 📧 **Email Notifications** - Automated registration confirmation emails
- 📊 **Dashboard** - Real-time registration statistics and management
- 🎨 **Modern UI** - Clean, responsive design with dark/light mode support

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Email**: Gmail SMTP, Resend (optional), EmailJS (optional)
- **UI Components**: Radix UI, shadcn/ui

## Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd compssa-registration-portal
npm install
\`\`\`

### 2. Environment Variables

Create a `.env.local` file in the root directory and add your configuration:

\`\`\`env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Email Configuration (Gmail)
NEXT_PUBLIC_GMAIL_USER=your-gmail@gmail.com
NEXT_PUBLIC_GMAIL_APP_PASSWORD=your-16-character-app-password

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 3. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and Firestore Database
3. Copy your Firebase configuration to the `.env.local` file
4. Deploy the Firestore security rules from `firestore.rules`

### 4. Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Add the credentials to your `.env.local` file

### 5. Create Admin Users

Run the setup script to create initial admin users:

\`\`\`bash
node scripts/setup-admin-users.js
\`\`\`

### 6. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the application.

## Default Admin Credentials

- **President**: president@compssa.edu / CompssaPresident2024!
- **Financial Officer**: financial@compssa.edu / CompssaFinancial2024!
- **Executive 1**: executive1@compssa.edu / CompssaExec2024!
- **Executive 2**: executive2@compssa.edu / CompssaExec2024!

## User Roles & Permissions

### President
- Full access to all features
- Can view all registrations
- Can validate payments
- Can manage all aspects of the system

### Financial Officer
- Can view all registrations
- Can validate payments
- Can access financial dashboard
- Cannot delete registrations

### Executive
- Can register new students
- Can view only their own registrations
- Cannot validate payments
- Cannot access financial dashboard

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_BASE_URL` to your production domain
5. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── financial/         # Financial dashboard
│   └── page.tsx          # Main application page
├── components/            # React components
│   └── ui/               # UI components (shadcn/ui)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── scripts/              # Setup scripts
├── public/               # Static assets
└── styles/               # Global styles
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the COMPSSA development team or create an issue in this repository.
