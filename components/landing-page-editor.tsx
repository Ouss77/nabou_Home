"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, ExternalLink, Star, Save, Eye, Instagram, Facebook, Twitter, Globe, Trash2 } from "lucide-react"
import Link from "next/link"

interface StoreProps {
  id: string
  title: string
  address: string
  description: string
  barber_name: string
  slug: string
}

interface LandingPageData {
  bio?: string
  specialties?: string[]
  experience_years?: number
  social_links?: {
    instagram?: string
    facebook?: string
    twitter?: string
    website?: string
  }
  external_booking_links?: Array<{
    platform: string
    url: string
    label: string
  }>
  testimonials?: Array<{
    name: string
    rating: number
    comment: string
  }>
}

interface LandingPageEditorProps {
  store: StoreProps
}

export function LandingPageEditor({ store }: LandingPageEditorProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [data, setData] = useState<LandingPageData>({
    bio: "",
    specialties: [],
    experience_years: 0,
    social_links: {},
    external_booking_links: [],
    testimonials: [],
  })

  // Form states
  const [newSpecialty, setNewSpecialty] = useState("")
  const [newBookingLink, setNewBookingLink] = useState({ platform: "", url: "", label: "" })
  const [newTestimonial, setNewTestimonial] = useState({ name: "", rating: 5, comment: "" })

  useEffect(() => {
    fetchLandingPageData()
  }, [store.id])

  const fetchLandingPageData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/barber/landing-page?storeId=${store.id}`)
      if (response.ok) {
        const result = await response.json()
        setData(
          result.data || {
            bio: "",
            specialties: [],
            experience_years: 0,
            social_links: {},
            external_booking_links: [],
            testimonials: [],
          },
        )
      }
    } catch (error) {
      console.error("Failed to fetch landing page data:", error)
      toast({
        title: "Error",
        description: "Failed to load landing page data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveLandingPageData = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/barber/landing-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: store.id,
          ...data,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Landing page updated successfully!",
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Failed to save landing page data:", error)
      toast({
        title: "Error",
        description: "Failed to save landing page data.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !data.specialties?.includes(newSpecialty.trim())) {
      setData((prev) => ({
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty.trim()],
      }))
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (specialty: string) => {
    setData((prev) => ({
      ...prev,
      specialties: prev.specialties?.filter((s) => s !== specialty) || [],
    }))
  }

  const addBookingLink = () => {
    if (newBookingLink.platform && newBookingLink.url && newBookingLink.label) {
      setData((prev) => ({
        ...prev,
        external_booking_links: [...(prev.external_booking_links || []), { ...newBookingLink }],
      }))
      setNewBookingLink({ platform: "", url: "", label: "" })
    }
  }

  const removeBookingLink = (index: number) => {
    setData((prev) => ({
      ...prev,
      external_booking_links: prev.external_booking_links?.filter((_, i) => i !== index) || [],
    }))
  }

  const addTestimonial = () => {
    if (newTestimonial.name && newTestimonial.comment) {
      setData((prev) => ({
        ...prev,
        testimonials: [...(prev.testimonials || []), { ...newTestimonial }],
      }))
      setNewTestimonial({ name: "", rating: 5, comment: "" })
    }
  }

  const removeTestimonial = (index: number) => {
    setData((prev) => ({
      ...prev,
      testimonials: prev.testimonials?.filter((_, i) => i !== index) || [],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading landing page editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Website Editor</h2>
          <p className="text-slate-600">Customize your professional landing page</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/profile/${store.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button onClick={saveLandingPageData} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your professional bio and experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell clients about yourself, your passion for barbering, and what makes you unique..."
                value={data.bio || ""}
                onChange={(e) => setData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={data.experience_years || ""}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, experience_years: Number.parseInt(e.target.value) || 0 }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
            <CardDescription>What services do you specialize in?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Beard Trimming, Fade Cuts..."
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
              />
              <Button onClick={addSpecialty} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.specialties?.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {specialty}
                  <button onClick={() => removeSpecialty(specialty)} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Connect with clients on social platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/username"
                  value={data.social_links?.instagram || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      social_links: { ...prev.social_links, instagram: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/page"
                  value={data.social_links?.facebook || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      social_links: { ...prev.social_links, facebook: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/username"
                  value={data.social_links?.twitter || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      social_links: { ...prev.social_links, twitter: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://yourwebsite.com"
                  value={data.social_links?.website || ""}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      social_links: { ...prev.social_links, website: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Booking Links */}
        <Card>
          <CardHeader>
            <CardTitle>External Booking Links</CardTitle>
            <CardDescription>Add links to other booking platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Platform (e.g., Booksy)"
                value={newBookingLink.platform}
                onChange={(e) => setNewBookingLink((prev) => ({ ...prev, platform: e.target.value }))}
              />
              <Input
                placeholder="Button Label"
                value={newBookingLink.label}
                onChange={(e) => setNewBookingLink((prev) => ({ ...prev, label: e.target.value }))}
              />
              <div className="flex gap-1">
                <Input
                  placeholder="URL"
                  value={newBookingLink.url}
                  onChange={(e) => setNewBookingLink((prev) => ({ ...prev, url: e.target.value }))}
                />
                <Button onClick={addBookingLink} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {data.external_booking_links?.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{link.label}</div>
                    <div className="text-sm text-slate-500">{link.platform}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={link.url} target="_blank">
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => removeBookingLink(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle>Client Testimonials</CardTitle>
          <CardDescription>Showcase positive feedback from your clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-2">
            <Input
              placeholder="Client Name"
              value={newTestimonial.name}
              onChange={(e) => setNewTestimonial((prev) => ({ ...prev, name: e.target.value }))}
            />
            <div className="flex items-center gap-1">
              <Label className="text-sm">Rating:</Label>
              <select
                value={newTestimonial.rating}
                onChange={(e) => setNewTestimonial((prev) => ({ ...prev, rating: Number.parseInt(e.target.value) }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Testimonial text"
              value={newTestimonial.comment}
              onChange={(e) => setNewTestimonial((prev) => ({ ...prev, comment: e.target.value }))}
            />
            <Button onClick={addTestimonial} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-3">
            {data.testimonials?.map((testimonial, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{testimonial.name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < testimonial.rating ? "text-yellow-500 fill-current" : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeTestimonial(index)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-slate-600">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
