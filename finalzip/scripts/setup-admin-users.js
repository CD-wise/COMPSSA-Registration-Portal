// Script to create admin users in Firestore
// Run this once to set up your admin users

import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyAbg3zC18VWvgoJMOVc33lYMAK3NcJ4rX8",
    authDomain: "compssa-register.firebaseapp.com",
    projectId: "compssa-register",
    storageBucket: "compssa-register.firebasestorage.app",
    messagingSenderId: "160471615333",
    appId: "1:160471615333:web:fcba7330289722fcce838c",
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
    console.log("=" * 50)

    // Create different types of admin users
    await createAdminUser("president@compssa.edu", "CompssaPresident2024!", "John Doe", "president")
    await createAdminUser("financial@compssa.edu", "CompssaFinancial2024!", "Jane Smith", "financial_officer")
    await createAdminUser("executive1@compssa.edu", "CompssaExec2024!", "Bob Johnson", "executive")
    await createAdminUser("executive2@compssa.edu", "CompssaExec2024!", "Alice Brown", "executive")

    console.log("=" * 50)
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