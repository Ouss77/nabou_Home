"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, X, Instagram, Facebook, Twitter, Globe, Star, Eye, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  website?: string
}

interface ExternalBookingLink {
  platform: string
  url: string
  label: string
}

interface Testimonial {
  name: string
  rating: number
  comment: string
}

interface LandingPageData {
  bio?: string
  specialties?: string[]
  experience_years?: number
  social_links?: SocialLinks
  external_booking_links?: ExternalBookingLink[]
  testimonials?: Testimonial[]
}

interface LandingPageEditorProps {
  storeId: string
  storeSlug: string
  initialData?: LandingPageData
}

export function LandingPageEditor({ storeId, storeSlug, initialData = {} }: LandingPageEditorProps) {
  const { toast } = useToast()
  const [data, setData] = useState<LandingPageData>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState("")
  const [showTestimonialDialog, setShowTestimonialDialog] = useState(false)
  const [showBookingLinkDialog, setShowBookingLinkDialog] = useState(false)
  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
    name: "",
    rating: 5,
    comment: "",
  })
  const [newBookingLink, setNewBookingLink] = useState<ExternalBookingLink>({
    platform: "",
    url: "",
    label: "",
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/barber/landing-page`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, ...data }),
      })

      if (!response.ok) {
        throw new Error("Failed to save landing page data")
      }

      toast({
        title: "Success",
        description: "Your landing page has been updated successfully!",
      })
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setData((prev) => ({
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty.trim()],
      }))
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (index: number) => {
    setData((prev) => ({
      ...prev,
      specialties: prev.specialties?.filter((_, i) => i !== index) || [],
    }))
  }

  const addTestimonial = () => {
    if (newTestimonial.name && newTestimonial.comment) {
      setData((prev) => ({
        ...prev,
        testimonials: [...(prev.testimonials || []), newTestimonial],
      }))
      setNewTestimonial({ name: "", rating: 5, comment: "" })
      setShowTestimonialDialog(false)
    }
  }

  const removeTestimonial = (index: number) => {
    setData((prev) => ({
      ...prev,
      testimonials: prev.testimonials?.filter((_, i) => i !== index) || [],
    }))
  }

  const addBookingLink = () => {
    if (newBookingLink.platform && newBookingLink.url && newBookingLink.label) {
      setData((prev) => ({
        ...prev,
        external_booking_links: [...(prev.external_booking_links || []), newBookingLink],
      }))
      setNewBookingLink({ platform: "", url: "", label: "" })
      setShowBookingLinkDialog(false)
    }
  }

  const removeBookingLink = (index: number) => {
    setData((prev) => ({
      ...prev,
      external_booking_links: prev.external_booking_links?.filter((_, i) => i !== index) || [],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Website</h2>
          <p className="text-muted-foreground">Customize your professional landing page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/profile/${storeSlug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Bio Section */}
        <Card>
          <CardHeader>
            <CardTitle>About You</CardTitle>
            <CardDescription>Tell your clients about yourself and your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Write a compelling bio that showcases your expertise and personality..."
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
                placeholder="e.g., 5"
                value={data.experience_years || ""}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, experience_years: Number.parseInt(e.target.value) || undefined }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
            <CardDescription>Highlight your areas of expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a specialty (e.g., Beard Styling)"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSpecialty()}
              />
              <Button onClick={addSpecialty}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.specialties?.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {specialty}
                  <button onClick={() => removeSpecialty(index)} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media & Website</CardTitle>
            <CardDescription>Connect with your clients on social platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/yourusername"
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
                  placeholder="https://facebook.com/yourpage"
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
                  placeholder="https://twitter.com/yourusername"
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>External Booking Links</CardTitle>
                <CardDescription>Add links to other booking platforms you use</CardDescription>
              </div>
              <Dialog open={showBookingLinkDialog} onOpenChange={setShowBookingLinkDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Booking Link</DialogTitle>
                    <DialogDescription>Add a link to another booking platform</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="platform">Platform Name</Label>
                      <Input
                        id="platform"
                        placeholder="e.g., Booksy, StyleSeat"
                        value={newBookingLink.platform}
                        onChange={(e) => setNewBookingLink((prev) => ({ ...prev, platform: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="label">Button Label</Label>
                      <Input
                        id="label"
                        placeholder="e.g., Book on Booksy"
                        value={newBookingLink.label}
                        onChange={(e) => setNewBookingLink((prev) => ({ ...prev, label: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="https://..."
                        value={newBookingLink.url}
                        onChange={(e) => setNewBookingLink((prev) => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                    <Button onClick={addBookingLink} className="w-full">
                      Add Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.external_booking_links?.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{link.label}</div>
                    <div className="text-sm text-muted-foreground">{link.platform}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeBookingLink(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!data.external_booking_links || data.external_booking_links.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No external booking links added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Client Testimonials</CardTitle>
                <CardDescription>Showcase positive feedback from your clients</CardDescription>
              </div>
              <Dialog open={showTestimonialDialog} onOpenChange={setShowTestimonialDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Testimonial
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Testimonial</DialogTitle>
                    <DialogDescription>Add a client testimonial to your landing page</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="client-name">Client Name</Label>
                      <Input
                        id="client-name"
                        placeholder="John D."
                        value={newTestimonial.name}
                        onChange={(e) => setNewTestimonial((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewTestimonial((prev) => ({ ...prev, rating: star }))}
                            className="p-1"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                star <= newTestimonial.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea
                        id="comment"
                        placeholder="Amazing haircut! Highly recommend..."
                        value={newTestimonial.comment}
                        onChange={(e) => setNewTestimonial((prev) => ({ ...prev, comment: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <Button onClick={addTestimonial} className="w-full">
                      Add Testimonial
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.testimonials?.map((testimonial, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeTestimonial(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">"{testimonial.comment}"</p>
                  <p className="font-medium text-sm">- {testimonial.name}</p>
                </div>
              ))}
              {(!data.testimonials || data.testimonials.length === 0) && (
                <p className="text-muted-foreground text-center py-4">No testimonials added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
