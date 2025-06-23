"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Download, DollarSign, Users, CreditCard, Smartphone, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useRegistrations } from "@/hooks/use-registrations"
import { logoutUser } from "@/lib/auth"
import { getRegistrationStats } from "@/lib/firestore"
import { Textarea } from "@/components/ui/textarea"
import { updateFinancialStatus } from "@/lib/firestore"
import { Check, X, MessageSquare, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdvancedFinancialDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [selectedProgramme, setSelectedProgramme] = useState("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [selectedExecutive, setSelectedExecutive] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    validated: 0,
    pending: 0,
    disputed: 0,
    byProgramme: {} as Record<string, number>,
  })

  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [validationAction, setValidationAction] = useState<{
    type: "validate" | "dispute"
    studentId: string
    studentName: string
  } | null>(null)
  const [validationNotes, setValidationNotes] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp.seconds * 1000)

      // Use consistent ISO format to avoid locale differences
      return date.toLocaleDateString("en-CA") // YYYY-MM-DD format
    } catch (error) {
      return "Invalid Date"
    }
  }

  // Get all registrations for financial monitoring - with higher limit for financial users
  const { students, loading: studentsLoading } = useRegistrations({
    limit: 100, // Higher limit for financial dashboard
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  })

  // Calculate executive performance stats
  const executiveStats = students.reduce(
    (acc, student) => {
      const executive = student.collectedBy
      if (!acc[executive]) {
        acc[executive] = {
          totalStudents: 0,
          totalAmount: 0,
          momoAmount: 0,
          cashAmount: 0,
          momoCount: 0,
          cashCount: 0,
        }
      }
      acc[executive].totalStudents += 1
      acc[executive].totalAmount += student.amountPaid

      if (student.paymentMethod === "MoMo") {
        acc[executive].momoAmount += student.amountPaid
        acc[executive].momoCount += 1
      } else {
        acc[executive].cashAmount += student.amountPaid
        acc[executive].cashCount += 1
      }

      return acc
    },
    {} as Record<
      string,
      {
        totalStudents: number
        totalAmount: number
        momoAmount: number
        cashAmount: number
        momoCount: number
        cashCount: number
      }
    >,
  )

  // Filter students based on selected filters
  const filteredStudents = students.filter((student) => {
    if (selectedProgramme !== "all" && student.programme !== selectedProgramme) return false
    if (selectedPaymentMethod !== "all" && student.paymentMethod !== selectedPaymentMethod) return false
    if (selectedExecutive !== "all" && student.collectedBy !== selectedExecutive) return false
    if (selectedDate) {
      const studentDate =
        student.timestamp instanceof Date
          ? student.timestamp.toISOString().split("T")[0]
          : new Date(student.timestamp.seconds * 1000).toISOString().split("T")[0]
      if (studentDate !== selectedDate) return false
    }
    return true
  })

  // Calculate filtered stats
  const filteredStats = {
    totalAmount: filteredStudents.reduce((sum, s) => sum + s.amountPaid, 0),
    momoAmount: filteredStudents.filter((s) => s.paymentMethod === "MoMo").reduce((sum, s) => sum + s.amountPaid, 0),
    cashAmount: filteredStudents.filter((s) => s.paymentMethod === "Cash").reduce((sum, s) => sum + s.amountPaid, 0),
    momoCount: filteredStudents.filter((s) => s.paymentMethod === "MoMo").length,
    cashCount: filteredStudents.filter((s) => s.paymentMethod === "Cash").length,
  }

  // Get unique executives for filter
  const executives = [...new Set(students.map((s) => s.collectedBy))]

  // Load statistics with caching
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statistics = await getRegistrationStats()
        setStats(statistics)
      } catch (error) {
        console.error("Error loading stats:", error)
      }
    }

    if (user) {
      loadStats()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logoutUser()
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

  const exportFinancialReport = () => {
    const csvContent = [
      [
        "Executive",
        "Student Name",
        "Student ID",
        "Programme",
        "Program Level",
        "Payment Method",
        "Amount (GHS)",
        "Registration Date",
        "Phone",
        "Email",
      ],
      ...filteredStudents.map((student) => [
        student.collectedBy,
        student.fullName,
        student.studentId,
        student.programme,
        student.programLevel,
        student.paymentMethod,
        student.amountPaid.toString(),
        formatDate(student.timestamp),
        student.phone,
        student.email,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `financial-monitoring-report_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportExecutiveReport = () => {
    const csvContent = [
      [
        "Executive Name",
        "Total Students",
        "Total Amount (GHS)",
        "Mobile Money Count",
        "Mobile Money Amount (GHS)",
        "Cash Count",
        "Cash Amount (GHS)",
      ],
      ...Object.entries(executiveStats).map(([executive, stats]) => [
        executive,
        stats.totalStudents.toString(),
        stats.totalAmount.toFixed(2),
        stats.momoCount.toString(),
        stats.momoAmount.toFixed(2),
        stats.cashCount.toString(),
        stats.cashAmount.toFixed(2),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `executive-performance-report_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleValidationAction = (type: "validate" | "dispute", studentId: string, studentName: string) => {
    setValidationAction({ type, studentId, studentName })
    setValidationNotes("")
    setShowValidationDialog(true)
  }

  const confirmValidation = async () => {
    if (!validationAction || !user) return

    setIsValidating(true)
    try {
      await updateFinancialStatus(
        validationAction.studentId,
        validationAction.type === "validate" ? "validated" : "disputed",
        user.name,
        validationNotes || undefined,
      )

      toast({
        title: `Payment ${validationAction.type === "validate" ? "Validated" : "Disputed"}`,
        description: `${validationAction.studentName}'s payment has been ${validationAction.type === "validate" ? "validated" : "disputed"}`,
      })

      setShowValidationDialog(false)
      setValidationAction(null)
      setValidationNotes("")
    } catch (error: any) {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleBulkValidation = async () => {
    if (selectedStudents.length === 0 || !user) return

    setIsValidating(true)
    try {
      await Promise.all(selectedStudents.map((studentId) => updateFinancialStatus(studentId, "validated", user.name)))

      toast({
        title: "Bulk Validation Complete",
        description: `${selectedStudents.length} payments have been validated`,
      })

      setSelectedStudents([])
    } catch (error: any) {
      toast({
        title: "Bulk Validation Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const toggleSelectAll = () => {
    const pendingStudents = filteredStudents
      .filter((s) => s.financialValidation?.status === "pending")
      .map((s) => s.id!)

    setSelectedStudents((prev) => (prev.length === pendingStudents.length ? [] : pendingStudents))
  }

  // Prevent hydration mismatch by ensuring client-side rendering
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
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

  // Redirect if not financial officer or president
  if (!user || (user.role !== "financial_officer" && user.role !== "president")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You need financial officer or president privileges to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                <h1 className="text-xl font-bold text-gray-900">Advanced Financial Dashboard</h1>
                <p className="text-sm text-gray-500">Executive Performance & Payment Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Registration Portal
              </Button>
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
        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-gray-900">GHS {filteredStats.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Smartphone className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mobile Money</p>
                  <p className="text-2xl font-bold text-gray-900">GHS {filteredStats.momoAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{filteredStats.momoCount} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cash</p>
                  <p className="text-2xl font-bold text-gray-900">GHS {filteredStats.cashAmount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{filteredStats.cashCount} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Executives</p>
                  <p className="text-2xl font-bold text-gray-900">{executives.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Performance Table */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Executive Performance Overview</CardTitle>
                <CardDescription>Monitor registration performance by executive members</CardDescription>
              </div>
              <Button onClick={exportExecutiveReport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Executive Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Executive Name</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Mobile Money</TableHead>
                    <TableHead>Cash</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(executiveStats)
                    .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
                    .map(([executive, stats]) => (
                      <TableRow key={executive}>
                        <TableCell className="font-medium">{executive}</TableCell>
                        <TableCell>{stats.totalStudents}</TableCell>
                        <TableCell>GHS {stats.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>GHS {stats.momoAmount.toFixed(2)}</div>
                            <div className="text-gray-500">({stats.momoCount} transactions)</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>GHS {stats.cashAmount.toFixed(2)}</div>
                            <div className="text-gray-500">({stats.cashCount} transactions)</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              stats.totalAmount > 1000
                                ? "bg-green-500 text-white"
                                : stats.totalAmount > 500
                                  ? "bg-yellow-500 text-white"
                                  : "bg-gray-500 text-white"
                            }
                          >
                            {stats.totalAmount > 1000 ? "Excellent" : stats.totalAmount > 500 ? "Good" : "Average"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Registration Records */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Financial Validation Center</CardTitle>
                <CardDescription>Review and validate student payments (showing recent entries)</CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedStudents.length > 0 && (
                  <Button
                    onClick={handleBulkValidation}
                    disabled={isValidating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Validate Selected ({selectedStudents.length})
                  </Button>
                )}
                <Button onClick={exportFinancialReport} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Enhanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">🟡 Pending</SelectItem>
                  <SelectItem value="validated">🟢 Validated</SelectItem>
                  <SelectItem value="disputed">🔴 Disputed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedExecutive} onValueChange={setSelectedExecutive}>
                <SelectTrigger>
                  <SelectValue placeholder="All Executives" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Executives</SelectItem>
                  {executives.map((executive) => (
                    <SelectItem key={executive} value={executive}>
                      {executive}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payment Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  <SelectItem value="MoMo">Mobile Money</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedProgramme} onValueChange={setSelectedProgramme}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programmes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programmes</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="IT">Diploma In IT</SelectItem>
                  <SelectItem value="pre">Pre-HND In IT</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filter by date"
              />
            </div>

            {/* Bulk Actions Bar */}
            {filteredStudents.filter((s) => s.financialValidation?.status === "pending").length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={
                      selectedStudents.length ===
                      filteredStudents.filter((s) => s.financialValidation?.status === "pending").length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    Select All Pending (
                    {filteredStudents.filter((s) => s.financialValidation?.status === "pending").length})
                  </span>
                </div>
                <Badge variant="outline">{selectedStudents.length} selected</Badge>
              </div>
            )}

            {studentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading financial records...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox checked={selectedStudents.length > 0} onCheckedChange={toggleSelectAll} />
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Executive</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className={selectedStudents.includes(student.id!) ? "bg-blue-50" : ""}>
                        <TableCell>
                          {student.financialValidation?.status === "pending" && (
                            <Checkbox
                              checked={selectedStudents.includes(student.id!)}
                              onCheckedChange={() => toggleStudentSelection(student.id!)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              student.financialValidation?.status === "validated"
                                ? "bg-green-500 text-white"
                                : student.financialValidation?.status === "disputed"
                                  ? "bg-red-500 text-white"
                                  : "bg-yellow-500 text-white"
                            }
                          >
                            {student.financialValidation?.status === "validated" && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {student.financialValidation?.status === "disputed" && (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            )}
                            {student.financialValidation?.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {student.financialValidation?.status === "validated"
                              ? "Validated"
                              : student.financialValidation?.status === "disputed"
                                ? "Disputed"
                                : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{student.fullName}</TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>{student.collectedBy}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              student.paymentMethod === "MoMo" ? "bg-green-600 text-white" : "bg-purple-500 text-white"
                            }
                          >
                            {student.paymentMethod === "MoMo" ? (
                              <>
                                <Smartphone className="w-3 h-3 mr-1" />
                                Mobile Money
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3 h-3 mr-1" />
                                Cash
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">GHS {student.amountPaid.toFixed(2)}</TableCell>
                        <TableCell>{formatDate(student.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {student.financialValidation?.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleValidationAction("validate", student.id!, student.fullName)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleValidationAction("dispute", student.id!, student.fullName)}
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            {student.financialValidation?.notes && (
                              <Button size="sm" variant="outline" title={student.financialValidation.notes}>
                                <MessageSquare className="w-3 h-3" />
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

            {!studentsLoading && filteredStudents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No registration records found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validation Dialog */}
        <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className={validationAction?.type === "validate" ? "text-green-600" : "text-red-600"}>
                {validationAction?.type === "validate" ? (
                  <>
                    <Check className="w-5 h-5 mr-2 inline" />
                    Validate Payment
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 mr-2 inline" />
                    Dispute Payment
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {validationAction?.type === "validate"
                  ? `Confirm that ${validationAction?.studentName}'s payment is correct and complete.`
                  : `Mark ${validationAction?.studentName}'s payment as disputed and provide a reason.`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {validationAction?.type === "dispute" && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Reason for Dispute *</Label>
                  <Textarea
                    id="notes"
                    placeholder="Explain why this payment is being disputed..."
                    value={validationNotes}
                    onChange={(e) => setValidationNotes(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmValidation}
                  disabled={isValidating || (validationAction?.type === "dispute" && !validationNotes.trim())}
                  className={
                    validationAction?.type === "validate"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {isValidating
                    ? "Processing..."
                    : validationAction?.type === "validate"
                      ? "Validate Payment"
                      : "Dispute Payment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
