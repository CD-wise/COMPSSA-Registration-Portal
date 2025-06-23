// Script to create admin users in Firestore
// Run this once to set up your admin users

import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth"

// Use environment variables for Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("❌ Missing Firebase environment variables!")
    console.log("Please make sure your .env.local file contains all Firebase configuration variables.")
    process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

async function createAdminUser(email, password, name, role) {
    try {
        console.log(`Creating admin user: ${name} (${role})...`)

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        console.log(`✅ Auth user created with UID: ${user.uid}`)

        // Add admin details to Firestore
        await setDoc(doc(db, "admins", user.uid), {
            email: email,
            name: name,
            role: role,
            createdAt: new Date(),
            active: true,
        })

        console.log(`✅ Admin document created in Firestore for: ${name} (${role})`)

        // Sign out the user after creation
        await signOut(auth)
    } catch (error) {
        console.error(`❌ Error creating admin user ${name}:`, error.message)

        // If user already exists, just update the Firestore document
        if (error.code === "auth/email-already-in-use") {
            console.log(`⚠️ User ${email} already exists, skipping...`)
        }
    }
}

// Create admin users
async function setupAdminUsers() {
    console.log("🚀 Setting up admin users...")
    console.log("=".repeat(50))

    // Create different types of admin users
    await createAdminUser("president@compssa.edu", "CompssaPresident2024!", "John Doe", "president")
    await createAdminUser("financial@compssa.edu", "CompssaFinancial2024!", "Jane Smith", "financial_officer")
    await createAdminUser("executive1@compssa.edu", "CompssaExec2024!", "Bob Johnson", "executive")
    await createAdminUser("executive2@compssa.edu", "CompssaExec2024!", "Alice Brown", "executive")

    console.log("=".repeat(50))
    console.log("✅ Admin users setup complete!")
    console.log("")
    console.log("📋 Login Credentials:")
    console.log("President: president@compssa.edu / CompssaPresident2024!")
    console.log("Financial: financial@compssa.edu / CompssaFinancial2024!")
    console.log("Executive 1: executive1@compssa.edu / CompssaExec2024!")
    console.log("Executive 2: executive2@compssa.edu / CompssaExec2024!")
}

// Run the setup
setupAdminUsers().catch(console.error)