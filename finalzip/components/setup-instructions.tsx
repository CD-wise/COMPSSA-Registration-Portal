import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Shield, Key, AlertCircle } from "lucide-react"

export default function GmailSetupInstructions() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-blue-600" />
            <CardTitle>Gmail App Password Setup Guide</CardTitle>
          </div>
          <CardDescription>
            Follow these steps to enable free email notifications for student registrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Enable 2-Factor Authentication</h3>
              <p className="text-gray-600 mb-3">
                Go to your Google Account settings and enable 2-factor authentication if not already enabled.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Visit: <strong>myaccount.google.com → Security → 2-Step Verification</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Generate App Password</h3>
              <p className="text-gray-600 mb-3">Create a specific app password for the registration portal.</p>
              <div className="bg-green-50 p-3 rounded-lg space-y-2">
                <p className="text-sm text-green-800">
                  <Key className="w-4 h-4 inline mr-1" />
                  Go to: <strong>myaccount.google.com → Security → App passwords</strong>
                </p>
                <p className="text-sm text-green-800">• Select "Mail" as the app type</p>
                <p className="text-sm text-green-800">• Copy the 16-character password (e.g., "abcd efgh ijkl mnop")</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Add Environment Variables</h3>
              <p className="text-gray-600 mb-3">Add your Gmail credentials to the environment variables.</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm">
                  GMAIL_USER=your-email@gmail.com
                  <br />
                  GMAIL_APP_PASSWORD=your-16-character-app-password
                </code>
              </div>
              <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  <strong>Important:</strong> Use the 16-character app password, NOT your regular Gmail password!
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Benefits of Gmail App Password:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>
                • <strong>100% Free</strong> - No monthly costs or limits
              </li>
              <li>
                • <strong>Reliable</strong> - Gmail's infrastructure ensures delivery
              </li>
              <li>
                • <strong>Professional</strong> - Emails sent from your Gmail address
              </li>
              <li>
                • <strong>Secure</strong> - App passwords are safer than regular passwords
              </li>
              <li>
                • <strong>Easy</strong> - One-time setup, works forever
              </li>
            </ul>
          </div>

          {/* Gmail Limits */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Gmail Sending Limits:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <Badge variant="outline" className="mb-2">
                  Personal Gmail
                </Badge>
                <p>• 500 emails per day</p>
                <p>• 100 recipients per email</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">
                  Google Workspace
                </Badge>
                <p>• 2,000 emails per day</p>
                <p>• 500 recipients per email</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Perfect for student registration notifications - well within limits!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
