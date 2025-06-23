"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Search, Download, Users, CheckCircle, Clock, Trash2, AlertCircle, BarChart3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useRegistrations } from "@/hooks/use-registrations"
import { loginUser, logoutUser } from "@/lib/auth"
import {
  addStudentRegistration,
  deleteStudentRegistration,
  searchStudents,
  type Student,
  type RegistrationData,
} from "@/lib/firestore"
import { sendRegistrationEmail } from "@/lib/email"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function RegistrationPortal() {
  const { user, loading: authLoading } = useAuth()
  const [selectedProgramme, setSelectedProgramme] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Success dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successData, setSuccessData] = useState<{
    studentName: string
    email: string
  } | null>(null)

  // Optimized registrations query - only show user's own registrations for regular users
  const filters = {
    ...(selectedProgramme !== "all" && { programme: selectedProgramme }),
    limit: 30, // Reduced limit to save reads
    // Regular executives only see their own registrations to reduce reads
    ...(user?.role === "executive" && { userId: user.uid }),
  }

  const { students, loading: studentsLoading } = useRegistrations(filters)

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    email: "",
    programme: "",
    programLevel: "",
    sex: "",
    phone: "",
    paymentMethod: "",
    amountPaid: "",
    souvenirs: [] as string[],
    penQuantity: "0",
    bookQuantity: "0",
  })

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    try {
      await loginUser(loginData.email, loginData.password)
      toast({
        title: "Login Successful",
        description: "Welcome to the registration portal!",
      })
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      setLoginData({ email: "", password: "" })
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to register students",
        variant: "destructive",
      })
      return
    }

    // Validate student ID length
    if (formData.studentId.length !== 9) {
      toast({
        title: "Invalid Student ID",
        description: "Student ID must be exactly 9 characters",
        variant: "destructive",
      })
      return
    }

    // Build souvenirs array
    const souvenirs = []
    if (Number.parseInt(formData.penQuantity) > 0) {
      souvenirs.push(`Pen (${formData.penQuantity})`)
    }
    if (Number.parseInt(formData.bookQuantity) > 0) {
      souvenirs.push(`Book (${formData.bookQuantity})`)
    }
    souvenirs.push(...formData.souvenirs)

    if (souvenirs.length === 0) {
      souvenirs.push("None")
    }

    const registrationData: RegistrationData = {
      ...formData,
      amountPaid: Number.parseFloat(formData.amountPaid),
      souvenirs,
      collectedBy: user.name,
      collectedByUid: user.uid,
    }

    try {
      await addStudentRegistration(registrationData)

      // Show success dialog immediately after successful registration
      setSuccessData({
        studentName: registrationData.fullName,
        email: registrationData.email,
      })
      setShowSuccessDialog(true)

      // Reset form
      setFormData({
        fullName: "",
        studentId: "",
        email: "",
        programme: "",
        programLevel: "",
        sex: "",
        phone: "",
        paymentMethod: "",
        amountPaid: "",
        souvenirs: [],
        penQuantity: "0",
        bookQuantity: "0",
      })

      toast({
        title: "Registration Successful",
        description: `${registrationData.fullName} has been registered successfully!`,
      })

      // Send welcome email to the student (in background)
      try {
        await sendRegistrationEmail({
          to: registrationData.email,
          studentName: registrationData.fullName,
          studentId: registrationData.studentId,
          programme: registrationData.programme,
          programLevel: registrationData.programLevel,
          amountPaid: registrationData.amountPaid,
          registrationDate: new Date().toLocaleDateString(),
          collectedBy: user.name,
        })

        console.log("✅ Welcome email sent successfully")
      } catch (emailError: any) {
        console.error("❌ Email sending failed:", emailError)
        // Don't show error toast for email failure, just log it
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Limit search results to reduce reads
      const results = await searchStudents(searchTerm, 20)
      setSearchResults(results)
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSouvenirChange = (souvenir: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        souvenirs: [...prev.souvenirs, souvenir],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        souvenirs: prev.souvenirs.filter((s) => s !== souvenir),
      }))
    }
  }

  const handleDelete = async (studentId: string, studentName: string) => {
    if (!user) return

    // Only allow deletion by the person who collected the registration or president
    const student = students.find((s) => s.id === studentId)
    if (!student) return

    if (student.collectedByUid !== user.uid && user.role !== "president") {
      toast({
        title: "Access Denied",
        description: "You can only delete registrations you collected",
        variant: "destructive",
      })
      return
    }

    if (window.confirm(`Are you sure you want to delete ${studentName}'s registration?`)) {
      try {
        await deleteStudentRegistration(studentId)
        toast({
          title: "Registration Deleted",
          description: `${studentName}'s registration has been deleted`,
        })
      } catch (error: any) {
        toast({
          title: "Delete Failed",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const exportData = () => {
    const dataToExport = searchResults.length > 0 ? searchResults : students

    const csvContent = [
      [
        "Full Name",
        "Student ID",
        "Email",
        "Programme",
        "Program Level",
        "Sex",
        "Phone",
        "Payment Method",
        "Amount Paid",
        "Souvenirs",
        "Registration Date",
        "Collected By",
      ],
      ...dataToExport.map((student) => [
        student.fullName,
        student.studentId,
        student.email,
        student.programme,
        student.programLevel,
        student.sex,
        student.phone,
        student.paymentMethod,
        student.amountPaid.toString(),
        student.souvenirs.join("; "),
        student.timestamp instanceof Date
          ? student.timestamp.toLocaleDateString()
          : new Date(student.timestamp.seconds * 1000).toLocaleDateString(),
        student.collectedBy,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `registrations_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validated
          </Badge>
        )
      case "disputed":
        return (
          <Badge className="bg-red-500 text-white">
            <AlertCircle className="w-3 h-3 mr-1" />
            Disputed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4 overflow-hidden">
              <img
                src="/compssa-logo.png"
                alt="COMPSSA Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.currentTarget.style.display = "none"
                  e.currentTarget.parentElement!.innerHTML =
                    '<div class="w-full h-full bg-green-600 rounded-full flex items-center justify-center"><span class="text-white font-bold text-lg">CPS</span></div>'
                }}
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">COMPSSA Portal</CardTitle>
            <CardDescription>Computer Science Department Registration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoggingIn}>
                {isLoggingIn ? "Logging in..." : "Login to Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayStudents = searchResults.length > 0 ? searchResults : students

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/compssa-logo.png"
                  alt="COMPSSA Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-sm">CPS</span>'
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">COMPSSA Portal</h1>
                <p className="text-sm text-gray-500">Computer Science Registration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Financial Dashboard Access Button */}
              {(user.role === "financial_officer" || user.role === "president") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/financial")}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Financial Dashboard
                </Button>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Stats Cards - No financial information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {user.role === "executive" ? "My Registrations" : "Total Students Registered"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      students.filter((s) => {
                        const studentDate =
                          s.timestamp instanceof Date ? s.timestamp : new Date(s.timestamp.seconds * 1000)
                        const today = new Date()
                        const diffTime = Math.abs(today.getTime() - studentDate.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 7
                      }).length
                    }
                  </p>
                  <p className="text-xs text-gray-500">Last 7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="register" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Student Registration</TabsTrigger>
            <TabsTrigger value="records">View Records</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register New Student</CardTitle>
                <CardDescription>Fill in the student details to complete registration</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID (9 characters) *</Label>
                      <Input
                        id="studentId"
                        value={formData.studentId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, studentId: e.target.value }))}
                        maxLength={9}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="programme">Programme *</Label>
                      <Select
                        value={formData.programme}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, programme: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Programme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                          <SelectItem value="IT">Diploma In IT</SelectItem>
                          <SelectItem value="pre">Pre-HND In IT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="programLevel">Program Level *</Label>
                      <Select
                        value={formData.programLevel}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, programLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Program Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Regular HND 100">Regular (Morning) HND 100</SelectItem>
                          <SelectItem value="Evening HND 100">Evening HND 100</SelectItem>
                          <SelectItem value="Part-time 100">Part-time 100</SelectItem>
                          <SelectItem value="BTECH 100">BTECH 100</SelectItem>
                          <SelectItem value="CYBER 100">CYBER 100</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex *</Label>
                      <Select
                        value={formData.sex}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, sex: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MoMo">Mobile Money</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amountPaid">Amount Paid (GHS) *</Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amountPaid}
                        onChange={(e) => setFormData((prev) => ({ ...prev, amountPaid: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Souvenirs Section */}
                  <div className="space-y-4">
                    <Label>Souvenirs Received</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="penQuantity">Pens</Label>
                        <Select
                          value={formData.penQuantity}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, penQuantity: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bookQuantity">Books</Label>
                        <Select
                          value={formData.bookQuantity}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, bookQuantity: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lacoste"
                          checked={formData.souvenirs.includes("Lacoste")}
                          onCheckedChange={(checked) => handleSouvenirChange("Lacoste", checked as boolean)}
                        />
                        <Label htmlFor="lacoste">Lacoste</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lapelPin"
                          checked={formData.souvenirs.includes("Lapel Pin")}
                          onCheckedChange={(checked) => handleSouvenirChange("Lapel Pin", checked as boolean)}
                        />
                        <Label htmlFor="lapelPin">Lapel Pin</Label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Register Student
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Student Records</CardTitle>
                    <CardDescription>
                      {user.role === "executive"
                        ? "View your registered students"
                        : "View registered students (limited to recent entries)"}
                    </CardDescription>
                  </div>
                  <Button onClick={exportData} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by Student ID or Name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                  <Select value={selectedProgramme} onValueChange={setSelectedProgramme}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by Programme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programmes</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="IT">Diploma In IT</SelectItem>
                      <SelectItem value="pre">Pre-HND In IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {studentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading records...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Programme</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.fullName}</TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.programme}</TableCell>
                            <TableCell>{getStatusBadge(student.financialValidation?.status || "pending")}</TableCell>
                            <TableCell>
                              {student.timestamp instanceof Date
                                ? student.timestamp.toLocaleDateString()
                                : new Date(student.timestamp.seconds * 1000).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {/* Only show delete button for own registrations or president */}
                                {(user.uid === student.collectedByUid || user.role === "president") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(student.id!, student.fullName)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {!studentsLoading && displayStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No students found matching your criteria.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Registration Successful!
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">Welcome to COMPSSA!</p>
                <p className="text-gray-600 mt-2">
                  <strong>{successData?.studentName}</strong> has been successfully registered.
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  A welcome email with registration details and chatbot access has been sent to:
                </p>
                <p className="text-sm font-medium text-green-600">{successData?.email}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowSuccessDialog(false)} className="bg-green-600 hover:bg-green-700">
              Continue Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
