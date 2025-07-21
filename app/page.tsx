"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Scissors,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Award,
  Heart,
  Target,
  Send,
  Loader2,
  AlertCircle,
  ImageIcon,
} from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { BarberRegistrationDialog } from "@/components/barber-registration-dialog"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"

interface Store {
  id: string
  title: string
  address: string
  description: string | null
  slug: string
  barber_id: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export default function HomePage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [showRegistration, setShowRegistration] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [featuredStores, setFeaturedStores] = useState<Store[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [storesError, setStoresError] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch featured stores on component mount
  useEffect(() => {
    fetchFeaturedStores()
  }, [])

  const fetchFeaturedStores = async () => {
    try {
      setLoadingStores(true)
      setStoresError(null)

      const response = await fetch("/api/stores")
      if (!response.ok) {
        throw new Error("Failed to fetch stores")
      }

      const storesData = await response.json()
      // Show only the first 3 stores as featured
      setFeaturedStores(Array.isArray(storesData) ? storesData.slice(0, 3) : [])
    } catch (error) {
      console.error("Error fetching stores:", error)
      setStoresError("Unable to load featured stores. Please try again later.")
      setFeaturedStores([])
    } finally {
      setLoadingStores(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      })

      if (response.ok) {
        toast({
          title: "Message sent!",
          description: "Thank you for your message. We'll get back to you soon.",
        })
        setContactForm({ name: "", email: "", message: "" })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

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

                <button
                  onClick={() => scrollToSection("stores")}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Featured Stores
                </button>
                <Link
                  href="/stores"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  All Stores
                </Link>
                <Link
                  href="/products"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Shop
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <LanguageSelector />
                <Link href="/login">
                  <Button variant="outline" className="font-medium bg-transparent">
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
                <button
                  onClick={() => scrollToSection("features")}
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2 w-full text-left"
                >
                  Services
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2 w-full text-left"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("stores")}
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2 w-full text-left"
                >
                  Featured Stores
                </button>
                <Link
                  href="/stores"
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2 w-full text-left"
                >
                  All Stores
                </Link>
                <Link
                  href="/products"
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2 w-full text-left"
                >
                  Shop
                </Link>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="block text-gray-600 hover:text-gray-900 font-medium py-2 w-full text-left"
                >
                  Contact
                </button>
                <div className="pt-4 border-t border-gray-200/50 space-y-3">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full font-medium bg-transparent">
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
                onClick={() => scrollToSection("stores")}
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
              >
                Book Appointment
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

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">About BarberBook</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing the barbershop industry with modern technology and exceptional service
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    At BarberBook, we're dedicated to empowering barbershops and salons with cutting-edge technology
                    that simplifies operations, enhances customer experience, and drives business growth. We believe
                    that every barber deserves access to professional-grade tools that help them focus on what they do
                    best – creating exceptional experiences for their clients.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Innovation</h4>
                    <p className="text-sm text-gray-600">Continuously evolving with the latest technology</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quality</h4>
                    <p className="text-sm text-gray-600">Delivering exceptional service and reliability</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Excellence</h4>
                    <p className="text-sm text-gray-600">Committed to helping businesses thrive</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose BarberBook?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Easy Setup</h4>
                      <p className="text-gray-600 text-sm">Get started in minutes with our intuitive setup process</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                      <p className="text-gray-600 text-sm">Our dedicated team is always here to help you succeed</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Affordable Pricing</h4>
                      <p className="text-gray-600 text-sm">
                        Transparent pricing with no hidden fees or long-term contracts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Secure & Reliable</h4>
                      <p className="text-gray-600 text-sm">Enterprise-grade security with 99.9% uptime guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores Section */}
      <section id="stores" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Barbershops</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover top-rated barbershops and book your appointment today
            </p>
          </div>

          {/* Loading State */}
          {loadingStores && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading featured stores...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {storesError && (
            <div className="max-w-md mx-auto">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{storesError}</AlertDescription>
              </Alert>
              <div className="text-center mt-4">
                <Button onClick={fetchFeaturedStores} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Featured Stores Grid */}
          {!loadingStores && !storesError && (
            <>
              {featuredStores.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Stores Available</h3>
                  <p className="text-gray-600 mb-6">We're currently setting up new locations. Check back soon!</p>
                  <Button onClick={() => setShowRegistration(true)}>
                    Register Your Store
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {featuredStores.map((store) => (
                      <StoreCard key={store.id} store={store} />
                    ))}
                  </div>

                  {/* View All Stores Button */}
                  <div className="text-center">
                    <Link href="/stores">
                      <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold bg-transparent">
                        View All Stores
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription>Fill out the form below and we'll get back to you within 24 hours.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="mt-1"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                        className="mt-1 min-h-[120px]"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                      <p className="text-gray-600">(555) 123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                      <p className="text-gray-600">support@barberbook.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                      <p className="text-gray-600">
                        123 Business Ave
                        <br />
                        Suite 100
                        <br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Business Hours</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Dialog */}
      <BarberRegistrationDialog open={showRegistration} onOpenChange={setShowRegistration} />
    </div>
  )
}

// Store Card Component
interface StoreCardProps {
  store: Store
}

function StoreCard({ store }: StoreCardProps) {
  const [storeImage, setStoreImage] = useState<string | null>(null)
  const [loadingImage, setLoadingImage] = useState(true)

  useEffect(() => {
    fetchStoreImage()
  }, [store.id])

  const fetchStoreImage = async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}/images`)
      if (response.ok) {
        const data = await response.json()
        const primaryImage = data.images?.find((img: any) => img.is_primary) || data.images?.[0]
        if (primaryImage) {
          setStoreImage(`data:${primaryImage.image_type || "image/jpeg"};base64,${primaryImage.image_data}`)
        }
      }
    } catch (error) {
      console.error("Error fetching store image:", error)
    } finally {
      setLoadingImage(false)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="aspect-video overflow-hidden bg-gray-100">
        {loadingImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : storeImage ? (
          <img
            src={storeImage || "/placeholder.svg"}
            alt={store.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : store.image_url ? (
          <img
            src={store.image_url || "/placeholder.svg"}
            alt={store.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{store.title}</CardTitle>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{store.address}</span>
          </div>
          {store.description && <p className="text-gray-600 line-clamp-2">{store.description}</p>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Link href={`/profile/${store.slug}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              View Profile
            </Button>
          </Link>
          <Link href={`/book/${store.slug}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              Book Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
