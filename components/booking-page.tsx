"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { formatCurrency } from "@/lib/currency-utils"
import { useLanguage } from "@/components/language-provider"

interface Service {
  id: number
  name: string
  price: number
  description: string
}

const BookingPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const { language } = useLanguage()

  useEffect(() => {
    // Replace with your actual data fetching logic
    const fetchServices = async () => {
      try {
        // Simulate fetching data from an API
        const data: Service[] = [
          { id: 1, name: "Basic Cleaning", price: 50, description: "A basic cleaning service." },
          { id: 2, name: "Deep Cleaning", price: 100, description: "A deep cleaning service." },
          { id: 3, name: "Window Cleaning", price: 75, description: "Window cleaning service." },
        ]
        setServices(data)
      } catch (error) {
        console.error("Error fetching services:", error)
      }
    }

    fetchServices()
  }, [])

  const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = Number.parseInt(event.target.value)
    const service = services.find((s) => s.id === serviceId)
    setSelectedService(service || null)
    setQuantity(1) // Reset quantity when service changes
  }

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number.parseInt(event.target.value)
    setQuantity(isNaN(newQuantity) ? 1 : newQuantity)
  }

  const calculateTotal = () => {
    if (selectedService) {
      return selectedService.price * quantity
    }
    return 0
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book a Service</h1>

      <div className="mb-4">
        <label htmlFor="service" className="block text-gray-700 text-sm font-bold mb-2">
          Select a Service:
        </label>
        <select
          id="service"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onChange={handleServiceChange}
          value={selectedService ? selectedService.id : ""}
        >
          <option value="">-- Select a Service --</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({formatCurrency(service.price, language)})
            </option>
          ))}
        </select>
      </div>

      {selectedService && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">{selectedService.name}</h2>
          <p className="text-gray-600">{selectedService.description}</p>
          <p className="text-gray-800 font-bold">Price: {formatCurrency(selectedService.price, language)}</p>
        </div>
      )}

      {selectedService && (
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
          />
        </div>
      )}

      {selectedService && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Total: {formatCurrency(calculateTotal(), language)}</h3>
        </div>
      )}
    </div>
  )
}

export { BookingPage }
export default BookingPage
