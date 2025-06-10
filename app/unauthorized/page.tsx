import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Please contact your administrator if you believe this is an error.</p>
            <div className="flex gap-2 justify-center">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
