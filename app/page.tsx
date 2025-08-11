"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Scissors,
  Users,
  ArrowRight,
  MapPin,
  Loader2,
  ImageIcon,
  Eye,
  Sparkles,
  Share2,
  Brush,
  CalendarCheck,
  MousePointerClick,
  Link2,
  Home,
  Star,
  Instagram,
  MessageCircle,
} from "lucide-react"
import { BarberRegistrationDialog } from "@/components/barber-registration-dialog"
import { useLanguage } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import logo from "@/public/logo.jpg"
interface Store {
  id: string
  title: string
  address: string
  description: string | null
  slug: string
  barber_id: string
  barber_name: string
  image_url: string | null
  created_at: string
  updated_at: string
}

interface Barber {
  id: string
  name: string
  email: string
  store?: Store
  avatar?: string
} 

export default function HomePage() {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const [showRegistration, setShowRegistration] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [featuredStores, setFeaturedStores] = useState<Store[]>([])
  const [featuredBarbers, setFeaturedBarbers] = useState<Barber[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [loadingBarbers, setLoadingBarbers] = useState(true)
  const [storesError, setStoresError] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch featured stores and barbers on component mount
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
      console.log("Fetched stores:", storesData)
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div> */}
              <Link href="/" className="text-2xl font-bold text-purple-900">
                <Image src={logo} alt="Nabou Logo" width={80} height={80} className="inline-block mr-2 rounded-md" />
              {/* <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Nabou
              </span> */}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-purple-700 hover:text-pink-600 font-medium transition-colors"
              >
                {t.landingPage.navigation.features}
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-purple-700 hover:text-pink-600 font-medium transition-colors"
              >
                {t.landingPage.navigation.howItWorks}
              </button>
              <button
                onClick={() => scrollToSection("featured-barbers")}
                className="text-purple-700 hover:text-pink-600 font-medium transition-colors"
              >
                {t.landingPage.navigation.barber}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Link href="/login">
                <Button variant="outline" className="bg-white text-purple-700 border-purple-300 hover:bg-purple-50">
                  <span className="hidden sm:inline">{t.landingPage.navigation.login}</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
              <Button
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg"
                onClick={() => setShowRegistration(true)}
              >
                <span className="hidden sm:inline">{t.landingPage.navigation.startFree}</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="h-4 w-4" />
              {t.landingPage.hero.badge}
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                {language === "fr" ? (
                  <>
                    <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Ton talent
                    </span>
                    <br />
                    <span className="text-purple-900">mis en lumière,</span>
                    <br />
                    <span className="text-purple-700">pas ton salon.</span>
                  </>
                ) : (
                  <>
                    <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Your talent
                    </span>
                    <br />
                    <span className="text-purple-900">in the spotlight,</span>
                    <br />
                    <span className="text-purple-700">not your salon.</span>
                  </>
                )}
              </h1>

              <p className="text-lg text-purple-700 max-w-xl">{t.landingPage.hero.subtitle}</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-xl text-lg px-8 py-4 rounded-xl"
                onClick={() => setShowRegistration(true)}
              >
                {t.landingPage.hero.startFree}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href={`https://nabou.vercel.app/profile/classic-cuts-barbershop`} className="flex-1">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-pink-300 text-pink-700 hover:bg-pink-50 text-lg px-8 py-4 rounded-xl bg-transparent w-full"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  {t.landingPage.hero.seeExample}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-purple-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t.landingPage.hero.trustIndicators.freeTrialMonths}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t.landingPage.hero.trustIndicators.monthlyPrice}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t.landingPage.hero.trustIndicators.noCommitment}
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative lg:left-20 left-0">
            <div className="relative bg-gradient-to-br from-pink-400 via-purple-500 to-pink-600 rounded-3xl p-8 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Beauty tools and scissors"
                width={600}
                height={400}
                className="w-full h-auto rounded-2xl"
              />
              {/* Floating notification */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {language === "fr" ? "+177 nouveaux clients" : "+177 new clients"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t.landingPage.features.title}
              </span>
            </h2>
            <p className="text-lg text-purple-700 max-w-2xl mx-auto">{t.landingPage.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">{t.landingPage.features.easyToCreate.title}</h3>
              <p className="text-purple-600">{t.landingPage.features.easyToCreate.description}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">{t.landingPage.features.shareableEverywhere.title}</h3>
              <p className="text-purple-600">{t.landingPage.features.shareableEverywhere.description}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">{t.landingPage.features.keepYourClients.title}</h3>
              <p className="text-purple-600">{t.landingPage.features.keepYourClients.description}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">{t.landingPage.features.showcaseYourTalent.title}</h3>
              <p className="text-purple-600">{t.landingPage.features.showcaseYourTalent.description}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Brush className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">{t.landingPage.features.customizable.title}</h3>
              <p className="text-purple-600">{t.landingPage.features.customizable.description}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <CalendarCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-900">{t.landingPage.features.instantBooking.title}</h3>
              <p className="text-purple-600">{t.landingPage.features.instantBooking.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gradient-to-br from-pink-50 to-purple-50 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t.landingPage.howItWorks.title}
              </span>
            </h2>
            <p className="text-lg text-purple-700">{t.landingPage.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <MousePointerClick className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-900 mb-2">{t.landingPage.howItWorks.step1.title}</h3>
                <p className="text-lg text-purple-700 font-medium mb-2">{t.landingPage.howItWorks.step1.description}</p>
                <p className="text-sm text-pink-600 font-medium">{t.landingPage.howItWorks.step1.detail}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <Link2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-900 mb-2">{t.landingPage.howItWorks.step2.title}</h3>
                <p className="text-lg text-purple-700 font-medium mb-2">{t.landingPage.howItWorks.step2.description}</p>
                <p className="text-sm text-pink-600 font-medium">{t.landingPage.howItWorks.step2.detail}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <Home className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-900 mb-2">{t.landingPage.howItWorks.step3.title}</h3>
                <p className="text-lg text-purple-700 font-medium mb-2">{t.landingPage.howItWorks.step3.description}</p>
                <p className="text-sm text-pink-600 font-medium">{t.landingPage.howItWorks.step3.detail}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Barbers Section */}
      <section id="featured-barbers" className="bg-white py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t.landingPage.featuredBarbers.title}
              </span>
            </h2>
            <p className="text-lg text-purple-700">{t.landingPage.featuredBarbers.subtitle}</p>
          </div>

          {loadingStores ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}

          {/* Testimonial */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-xl italic text-purple-900 mb-6">
                  "{t.landingPage.featuredBarbers.testimonial.quote}"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-pink-200 text-pink-700">L</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-purple-900">{t.landingPage.featuredBarbers.testimonial.author}</p>
                    <p className="text-sm text-purple-600">{t.landingPage.featuredBarbers.testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {t.landingPage.faq.title}
              </span>
            </h2>
          </div>

          <div className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">
                  {t.landingPage.faq.questions.isFree.question}
                </h3>
                <p className="text-purple-700">{t.landingPage.faq.questions.isFree.answer}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">
                  {t.landingPage.faq.questions.needApp.question}
                </h3>
                <p className="text-purple-700">{t.landingPage.faq.questions.needApp.answer}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">
                  {t.landingPage.faq.questions.canStop.question}
                </h3>
                <p className="text-purple-700">{t.landingPage.faq.questions.canStop.answer}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">
                  {t.landingPage.faq.questions.notSelfEmployed.question}
                </h3>
                <p className="text-purple-700">{t.landingPage.faq.questions.notSelfEmployed.answer}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              {/* <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Nabou</span>
              </div> */}
              <div className="flex items-center gap-3 mb-4">
                <Image src={logo} alt="Nabou Logo" width={120} height={120} className="inline-block mr-2 rounded-md" />
                {/* <span className="text-2xl font-bold text-white">Nabou</span>   */}
                </div>
              <p className="text-gray-400 mb-4 max-w-md">{t.landingPage.footer.tagline}</p>
              <p className="text-sm italic text-purple-300">"{t.landingPage.footer.quote}"</p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">{t.landingPage.footer.navigation}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t.landingPage.footer.home}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t.landingPage.footer.features}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t.landingPage.footer.pricing}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    {t.landingPage.footer.faq}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">{t.landingPage.footer.followUs}</h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>{t.landingPage.footer.copyright}</p>
          </div>
        </div>
      </footer>

      {/* Registration Dialog */}
      <BarberRegistrationDialog open={showRegistration} onOpenChange={setShowRegistration} />
    </div>
  )
}

interface StoreCardProps {
  store: Store
}

export function StoreCard({ store }: StoreCardProps) {
  const { t } = useLanguage()
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
    <Card className="group overflow-hidden rounded-2xl shadow-lg transition-all hover:shadow-2xl border border-gray-100">
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {loadingImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : storeImage || store.image_url ? (
          <img
            src={storeImage || store.image_url || "/placeholder.svg"}
            alt={store.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-semibold text-gray-800">{store.title}</CardTitle>
        <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{store.address}</span>
        </div>
        {store.description && <p className="mt-2 text-gray-500 text-sm line-clamp-2">{store.description}</p>}
      </CardHeader>

      <CardContent className="mt-4 space-y-2">
        <div className="flex gap-3">
          <Link href={`/profile/${store.slug}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors bg-transparent"
            >
              {t.landingPage.featuredBarbers.viewProfile}
            </Button>
          </Link>
          <Link href={`/book/${store.slug}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white shadow-md">
              {t.landingPage.featuredBarbers.bookNow}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
