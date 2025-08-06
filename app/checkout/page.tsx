"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart,
  Scissors,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
  stock_quantity: number
  is_active: boolean
  created_at: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface CheckoutForm {
  // Contact Information
  firstName: string
  lastName: string
  email: string
  phone: string

  // Shipping Address
  address: string
  city: string
  state: string
  zipCode: string
  country: string

  // Payment Method
  paymentMethod: "card" | "paypal" | "cod"

  // Card Details (if card payment)
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string

  // Additional Notes
  notes: string
}

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "United States",
  paymentMethod: "card",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardName: "",
  notes: "",
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<CheckoutForm>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      loadCartItems()
    }
  }, [products])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const productsData = await response.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const loadCartItems = () => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("barberbook-cart")
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        const items: CartItem[] = []

        Object.entries(cart).forEach(([productId, quantity]) => {
          const product = products.find((p) => p.id === productId)
          if (product && typeof quantity === "number") {
            items.push({ product, quantity })
          }
        })

        setCartItems(items)
      }
    }
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const getTax = () => {
    return getSubtotal() * 0.08 // 8% tax
  }

  const getTotal = () => {
    return getSubtotal() + getTax()
  }

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Contact validation
    if (!form.firstName.trim()) newErrors.firstName = "First name is required"
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!form.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid"
    if (!form.phone.trim()) newErrors.phone = "Phone number is required"

    // Address validation
    if (!form.address.trim()) newErrors.address = "Address is required"
    if (!form.city.trim()) newErrors.city = "City is required"
    if (!form.state.trim()) newErrors.state = "State is required"
    if (!form.zipCode.trim()) newErrors.zipCode = "ZIP code is required"

    // Card validation (if card payment)
    if (form.paymentMethod === "card") {
      if (!form.cardNumber.trim()) newErrors.cardNumber = "Card number is required"
      if (!form.expiryDate.trim()) newErrors.expiryDate = "Expiry date is required"
      if (!form.cvv.trim()) newErrors.cvv = "CVV is required"
      if (!form.cardName.trim()) newErrors.cardName = "Cardholder name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Create order
      const orderData = {
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        },
        shipping: {
          address: form.address,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        },
        payment: {
          method: form.paymentMethod,
          ...(form.paymentMethod === "card" && {
            cardLast4: form.cardNumber.slice(-4),
          }),
        },
        totals: {
          subtotal: getSubtotal(),
          tax: getTax(),
          total: getTotal(),
        },
        notes: form.notes,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()

        // Clear cart
        if (typeof window !== "undefined") {
          localStorage.removeItem("barberbook-cart")
        }

        // Redirect to success page
        router.push(`/checkout/success?orderId=${order.id}`)
      } else {
        throw new Error("Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const updateForm = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading checkout...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to your cart before proceeding to checkout.</p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
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
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure Checkout
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => updateForm("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => updateForm("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => updateForm("address", e.target.value)}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => updateForm("city", e.target.value)}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => updateForm("state", e.target.value)}
                        className={errors.state ? "border-red-500" : ""}
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={form.zipCode}
                        onChange={(e) => updateForm("zipCode", e.target.value)}
                        className={errors.zipCode ? "border-red-500" : ""}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <select
                        id="country"
                        value={form.country}
                        onChange={(e) => updateForm("country", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <label
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${form.paymentMethod === "card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={form.paymentMethod === "card"}
                        onChange={(e) => updateForm("paymentMethod", e.target.value as "card" | "paypal" | "cod")}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-medium">Credit Card</div>
                      </div>
                    </label>
                    <label
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${form.paymentMethod === "paypal" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={form.paymentMethod === "paypal"}
                        onChange={(e) => updateForm("paymentMethod", e.target.value as "card" | "paypal" | "cod")}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="h-6 w-6 mx-auto mb-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          P
                        </div>
                        <div className="font-medium">PayPal</div>
                      </div>
                    </label>
                    <label
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${form.paymentMethod === "cod" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={form.paymentMethod === "cod"}
                        onChange={(e) => updateForm("paymentMethod", e.target.value as "card" | "paypal" | "cod")}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <Truck className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-medium">Cash on Delivery</div>
                      </div>
                    </label>
                  </div>

                  {form.paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={form.cardNumber}
                          onChange={(e) => updateForm("cardNumber", e.target.value)}
                          className={errors.cardNumber ? "border-red-500" : ""}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={form.expiryDate}
                            onChange={(e) => updateForm("expiryDate", e.target.value)}
                            className={errors.expiryDate ? "border-red-500" : ""}
                          />
                          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={form.cvv}
                            onChange={(e) => updateForm("cvv", e.target.value)}
                            className={errors.cvv ? "border-red-500" : ""}
                          />
                          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Cardholder Name *</Label>
                        <Input
                          id="cardName"
                          value={form.cardName}
                          onChange={(e) => updateForm("cardName", e.target.value)}
                          className={errors.cardName ? "border-red-500" : ""}
                        />
                        {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                      </div>
                    </div>
                  )}

                  {form.paymentMethod === "paypal" && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm">
                        You will be redirected to PayPal to complete your payment securely.
                      </p>
                    </div>
                  )}

                  {form.paymentMethod === "cod" && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800 text-sm">
                        Pay with cash when your order is delivered. Additional delivery charges may apply.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special instructions for your order..."
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Scissors className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.product.name}</div>
                          <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-sm font-medium">{formatCurrency(item.product.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                      <span>{formatCurrency(getSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (8%)</span>
                      <span>{formatCurrency(getTax())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  {/* Security badges */}
                  <div className="pt-4 border-t">
                    <div className="text-xs text-gray-500 text-center mb-2">Secure & Protected</div>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        SSL Encrypted
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Money Back Guarantee
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
