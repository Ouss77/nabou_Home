"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scissors, Calendar, Users, Star, ArrowRight, Menu, X } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { BarberRegistrationDialog } from "@/components/barber-registration-dialog"
import { useLanguage } from "@/components/language-provider"

export default function HomePage() {
  const { t } = useLanguage()
  const [showRegistration, setShowRegistration] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:gap-4 transition-all duration-300">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                BarberBook
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                <Link
                  href="#features"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Services
                </Link>
                <Link
                  href="#about"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Contact
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <LanguageSelector />
                <Link href="/login">
                  <Button variant="outline" className="font-medium">
                    Login
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowRegistration(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <LanguageSelector />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-md">
              <div className="px-4 py-4 space-y-4">
                <Link
                  href="#features"
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="#about"
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="pt-4 border-t border-gray-200/50 space-y-3">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full font-medium">
                      Login
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setShowRegistration(true)
                      setMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-medium"
                  >
                    Start Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-slate-100/50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div>
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200"
              >
                Professional Booking Platform
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Modern Barber Management System
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Streamline your barbershop operations with our comprehensive booking and management platform
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => setShowRegistration(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Barbershop
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your operations with our comprehensive suite of tools designed specifically for barbers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Smart Booking System</CardTitle>
                  <CardDescription className="text-gray-600">
                    Let customers book appointments online 24/7 with automatic confirmations and reminders.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div>
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Customer Management</CardTitle>
                  <CardDescription className="text-gray-600">
                    Keep track of customer preferences, history, and contact information in one place.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div>
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Service Management</CardTitle>
                  <CardDescription className="text-gray-600">
                    Easily manage your services, pricing, and availability with our intuitive interface.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Dialog */}
      <BarberRegistrationDialog open={showRegistration} onOpenChange={setShowRegistration} />
    </div>
  )
}
