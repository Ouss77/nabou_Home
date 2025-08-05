import { SimpleLoginForm } from "@/components/simple-login-form"
import { Scissors } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-100 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left side - image with text on top */}
        <div className="relative flex items-center justify-center p-10 bg-cover bg-center "
             style={{ backgroundImage: "url('https://media.gettyimages.com/id/1325440885/photo/retro-styled-beauty-salon.jpg?s=612x612&w=0&k=20&c=uEdh3ypS-Zeq9X5YJzIfBaiaoFYstRFNowZBTbQWT8I=')" }}>
          {/* Overlay to improve text contrast */}
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="relative z-10 text-white text-center max-w-md">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Welcome to Nabou</h1>
            <p className="text-lg drop-shadow-md">
              Your style, your barber, your time. Book appointments with ease and confidence.
            </p>
          </div>
        </div>

        {/* Right side - login form */}
        <div className="flex items-center justify-center p-12 bg-white">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-3xl font-bold text-purple-900 hover:text-slate-600 transition-colors"
              >
                <Scissors className="h-8 w-8" />
                Nabou
              </Link>
            </div>
            <SimpleLoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
