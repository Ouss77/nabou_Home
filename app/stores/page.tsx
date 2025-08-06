"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Filter, Loader2, ImageIcon, ArrowRight, Scissors } from "lucide-react"
import Link from "next/link"

interface Store {
  id: string
  title: string
  address: string
  description: string | null
  slug: string
  barber_name: string
  city: string
  image_url: string | null
  created_at: string
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [cities, setCities] = useState<string[]>([])
  const [storeImages, setStoreImages] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchStores()
  }, [])

  useEffect(() => {
    filterStores()
  }, [stores, searchTerm, selectedCity])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/stores")
      if (response.ok) {
        const storesData = await response.json()

        // Extract cities from addresses
        const uniqueCities = [
          ...new Set(
            storesData.map((store: Store) => {
              const addressParts = store.address.split(",")
              return addressParts[addressParts.length - 2]?.trim() || "Unknown"
            }),
          ),
        ].sort()

        setStores(storesData)
        setCities(uniqueCities)

        // Fetch images for each store
        storesData.forEach((store: Store) => {
          fetchStoreImage(store.id)
        })
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStoreImage = async (storeId: string) => {
    try {
      const response = await fetch(`/api/stores/${storeId}/images`)
      if (response.ok) {
        const data = await response.json()
        const primaryImage = data.images?.find((img: any) => img.is_primary) || data.images?.[0]
        if (primaryImage) {
          setStoreImages((prev) => ({
            ...prev,
            [storeId]: `data:${primaryImage.image_type};base64,${primaryImage.image_data}`,
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching store image:", error)
    }
  }

  const filterStores = () => {
    let filtered = stores

    if (searchTerm) {
      filtered = filtered.filter(
        (store) =>
          store.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.barber_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCity) {
      filtered = filtered.filter((store) => {
        const storeCity = store.address.split(",")[store.address.split(",").length - 2]?.trim()
        return storeCity === selectedCity
      })
    }

    setFilteredStores(filtered)
  }

  const getStoreCity = (address: string) => {
    const parts = address.split(",")
    return parts[parts.length - 2]?.trim() || "Unknown"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading stores...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">BarberBook</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button variant="outline">Shop Products</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Barber</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover professional barbers and book appointments at top-rated barbershops in your area
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by barber name, shop name, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCity("")
                }}
                className="md:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredStores.length} of {stores.length} barbershops
            {selectedCity && ` in ${selectedCity}`}
          </p>
        </div>

        {/* Stores Grid */}
        {filteredStores.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stores Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCity
                  ? "Try adjusting your search criteria or filters"
                  : "No barbershops are currently available"}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCity("")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} imageUrl={storeImages[store.id]} getStoreCity={getStoreCity} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface StoreCardProps {
  store: Store
  imageUrl?: string
  getStoreCity: (address: string) => string
}

function StoreCard({ store, imageUrl, getStoreCity }: StoreCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="aspect-video overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl || "/placeholder.svg"}
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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{store.title}</CardTitle>
            <p className="text-sm text-gray-600 font-medium">{store.barber_name}</p>
          </div>
          <Badge variant="secondary" className="ml-2">
            {getStoreCity(store.address)}
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{store.address}</span>
          </div>
          {store.description && <p className="text-gray-600 line-clamp-2">{store.description}</p>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
