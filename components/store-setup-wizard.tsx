"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { StepIndicator } from "./wizard/step-indicator"
import { Step1StoreInfo } from "./wizard/step1-store-info"
import { Step2Services } from "./wizard/step2-services"
import { Step3WorkingHours } from "./wizard/step3-working-hours"
import { Step4Images } from "./wizard/step4-images"
import { Step5Confirmation } from "./wizard/step5-confirmation"
import type { Store } from "@/lib/db"

interface StoreSetupWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (store: Store) => void
}

const WIZARD_STEPS = ["Store Info", "Services", "Working Hours", "Images", "Complete"]

export function StoreSetupWizard({ open, onOpenChange, onSuccess }: StoreSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [store, setStore] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Reset wizard state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      setStore(null)
      setIsLoading(false)
    }
  }, [open])

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleStoreCreate = async (storeData: {
    title: string
    address: string
    description: string
    imageUrl?: string
  }) => {
    setIsLoading(true)
    try { 
      const response = await fetch("/api/barber/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeData),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to create store.")
      }

      setStore(result.store)
      handleNext()
    } catch (error) {
      console.error("Store creation error:", error)
      // You can add error handling UI here
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = () => {
    setCurrentStep(5) // Go to confirmation step
  }

  const handleComplete = () => {
    if (store) {
      onSuccess(store)
    }
    onOpenChange(false)
  }

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Setting up your store...</p>
          </div>
        </div>
      )
    }

    switch (currentStep) {
      case 1:
        return <Step1StoreInfo onNext={handleStoreCreate} />
      case 2:
        return store ? <Step2Services storeId={store.id} onNext={handleNext} onBack={handleBack} /> : null
      case 3:
        return store ? <Step3WorkingHours storeId={store.id} onNext={handleNext} onBack={handleBack} /> : null
      case 4:
        return store ? <Step4Images storeId={store.id} onFinish={handleFinish} onBack={handleBack} /> : null
      case 5:
        return store ? <Step5Confirmation store={store} onComplete={handleComplete} /> : null
      default:
        return <div>Step not found</div>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome! Let's Set Up Your Store</DialogTitle>
          <DialogDescription>
            Follow these steps to create your barber profile and start accepting appointments.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          <Progress value={(currentStep / WIZARD_STEPS.length) * 100} className="mb-4" />
          <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  )
}
