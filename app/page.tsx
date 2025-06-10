import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scissors, Calendar, Users, Star, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-slate-800" />
            <span className="text-2xl font-bold text-slate-800">BarberBook</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/admin">
              <Button>Admin Portal</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Professional Barber Management
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Streamline Your
            <span className="text-blue-600"> Barbershop</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Complete appointment management system for modern barbershops. Manage bookings, showcase services, and grow
            your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed specifically for barbershops and their clients
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Intuitive calendar and table views for managing appointments efficiently
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Easy booking system for clients with contact information tracking</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Scissors className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Service Showcase</CardTitle>
                <CardDescription>
                  Beautiful public pages to display services, prices, and store information
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Professional Design</CardTitle>
                <CardDescription>Modern, responsive design that looks great on all devices</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>Instant notifications and updates for new appointments</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Multi-location</CardTitle>
                <CardDescription>
                  Support for multiple barbers and locations with centralized management
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">See It In Action</h2>
            <p className="text-xl text-slate-600">Experience the clean, intuitive interface</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="BarberBook Dashboard"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-800 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Barbershop?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of barbers who have streamlined their business with BarberBook
          </p>
          <Link href="/admin">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Scissors className="h-6 w-6" />
              <span className="text-xl font-bold">BarberBook</span>
            </div>
            <div className="text-slate-400">© 2024 BarberBook. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
