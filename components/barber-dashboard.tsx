"use client"

import type React from "react"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Store } from "@/types"
import { StoreSetupWizard } from "@/components/store-setup-wizard"

interface BarberDashboardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function BarberDashboard({ className, ...props }: BarberDashboardProps) {
  const [isStoreSetupOpen, setIsStoreSetupOpen] = useState(false)
  const [store, setStore] = useState<Store | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    api
      .get("/stores")
      .then((response) => {
        setStore(response.data[0] || null)
      })
      .catch((error) => {
        console.error("Error fetching stores:", error)
        toast({
          title: "Error fetching store",
          description: "Failed to retrieve store information.",
          variant: "destructive",
        })
      })
  }, [])

  const handleSuccess = (newStore: Store) => {
    setStore(newStore)
    setIsStoreSetupOpen(false)
    toast({
      title: "Store created!",
      description: "Your store has been successfully created.",
    })
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Manage your barber shop and appointments.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {store ? (
            <div>
              <p>Store Name: {store.name}</p>
              <p>Store Description: {store.description}</p>
            </div>
          ) : (
            <div>
              <p>No store found. Please create a store.</p>
            </div>
          )}
          <Button onClick={() => setIsStoreSetupOpen(true)}>{store ? "Edit Store" : "Create Store"}</Button>
        </CardContent>
      </Card>
      <StoreSetupWizard
        open={isStoreSetupOpen}
        onOpenChange={setIsStoreSetupOpen}
        store={store}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
