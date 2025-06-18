import { SimpleLoginForm } from "@/components/simple-login-form"
import { Scissors } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-slate-800 hover:text-slate-600 transition-colors"
          >
            <Scissors className="h-8 w-8" />
            BarberBook
          </Link>
        </div>
        <SimpleLoginForm />
      </div>
    </div>
  )
}
