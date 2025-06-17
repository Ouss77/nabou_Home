"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scissors, Calendar, Users, Star, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"

interface Store {
  id: string
  title: string
  address: string
  description: string
  image_url: string
}

export default function HomePage() {
  const { t } = useLanguage()
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch("/api/stores")
        const data = await response.json()
        console.log("stores:", data)

        setStores(data)
      } catch (error) {
        console.error("Error fetching stores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStores()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
<header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-999">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Scissors className="h-8 w-8 text-slate-800" />
      <span className="text-2xl font-bold text-slate-800">{t.home.title}</span>
    </div>
    <div className="flex items-center gap-4">
      <LanguageSelector />
      <Link href="/login">
        <Button className="border-2" variant="ghost">{t.nav.login}</Button>
      </Link>
      <Link href="/register">
        <Button>{t.nav.subscribe || "Start for Free"}</Button>
      </Link>
    </div>
  </div>
</header>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://media.gettyimages.com/id/1493228916/photo/barber-shop-interior-with-chairs-mirrors-pendant-lights-brick-wall-and-cityscape-from-the.jpg?s=1024x1024&w=gi&k=20&c=MS0GRgodSUNMzXWphiUx12zcveDTlGw95IVw_tb1UcU="
            alt="Barbershop background"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        </div>

        {/* Content */}
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-none">
            {t.home.subtitle}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            {t.home.heroTitle.split(" ").slice(0, 2).join(" ")}
            <span className="text-blue-400"> {t.home.heroTitle.split(" ").slice(2).join(" ")}</span>
          </h1>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">{t.home.heroSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="text-lg px-8 bg-blue-400 hover:bg-blue-500 text-black">
                {t.nav.getStarted}
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 border-white hover:bg-white/10">
                {t.nav.learnMore}
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 rounded-full bg-white/20">
            <div className="w-full h-1/2 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t.home.features.title}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t.home.features.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>{t.home.features.smartScheduling.title}</CardTitle>
                <CardDescription>{t.home.features.smartScheduling.description}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>{t.home.features.clientManagement.title}</CardTitle>
                <CardDescription>{t.home.features.clientManagement.description}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Scissors className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>{t.home.features.serviceShowcase.title}</CardTitle>
                <CardDescription>{t.home.features.serviceShowcase.description}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>{t.home.features.professionalDesign.title}</CardTitle>
                <CardDescription>{t.home.features.professionalDesign.description}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>{t.home.features.realTimeUpdates.title}</CardTitle>
                <CardDescription>{t.home.features.realTimeUpdates.description}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>{t.home.features.multiLocation.title}</CardTitle>
                <CardDescription>{t.home.features.multiLocation.description}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t.home.ourBarbershops}</h2>
            <p className="text-xl text-slate-600">{t.home.findAndBook}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stores.map((store) => (
                <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src={store.image_url || "/placeholder-store.jpg"}
                      alt={store.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{store.title}</CardTitle>
                    <CardDescription className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 shrink-0 text-slate-400" />
                      <span>{store.address}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {store.description || "Experience professional barbering services at our modern facility."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/book/${store.id}`} className="w-full">
                      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">{t.home.bookNow}</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-800 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">{t.home.readyToTransform}</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">{t.home.readyDescription}</p>
          <Link href="/admin">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              {t.home.startFreeTrial}
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
              <span className="text-xl font-bold">{t.home.title}</span>
            </div>
            <div className="text-slate-400">{t.home.copyright}</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
