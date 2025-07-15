"use client"

import type { Dispatch, SetStateAction } from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
  onOpenChange: Dispatch<SetStateAction<boolean>>
  store: Store | null
  onSuccess: () => void
}

const WIZARD_STEPS = ["Store Info", "Services", "Working Hours", "Images"]

export function StoreSetupWizard({ open, onOpenChange, store: initialStore, onSuccess }: StoreSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [store, setStore] = useState<Store | null>(initialStore)
  const [isLoading, setIsLoading] = useState(false)

  // Reset state when dialog is closed or the initial store changes
  useEffect(() => {
    if (open) {
      setStore(initialStore)
      setCurrentStep(1)
    }
  }, [open, initialStore])

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length + 1))
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const handleStoreSave = async (data: Partial<Store>) => {
    setIsLoading(true)
    try {
      const url = store ? `/api/barber/store/${store.id}` : "/api/barber/store"
      const method = store ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to save store information.")
      }

      setStore(result.store)
      handleNext()
    } catch (error) {
      console.error(error)
      // You can add an error state here to show the user
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = () => {
    setCurrentStep(5) // Go to confirmation step
  }

  const handleCloseAndRefresh = () => {
    onOpenChange(false)
    onSuccess()
  }

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    switch (currentStep) {
      case 1:
        return <Step1StoreInfo store={store} onSave={handleStoreSave} />
      case 2:
        return store ? <Step2Services storeId={store.id} onNext={handleNext} onBack={handleBack} /> : null
      case 3:
        return store ? <Step3WorkingHours storeId={store.id} onNext={handleNext} onBack={handleBack} /> : null
      case 4:
        return store ? <Step4Images storeId={store.id} onFinish={handleFinish} onBack={handleBack} /> : null
      case 5:
        return store ? <Step5Confirmation store={store} onClose={handleCloseAndRefresh} /> : null
      default:
        return <div>Step not found</div>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>{initialStore ? "Edit Your Store" : "Create Your Store"}</DialogTitle>
          <DialogDescription>Follow the steps to get your store ready for customers.</DialogDescription>
        </DialogHeader>

        {currentStep <= WIZARD_STEPS.length && (
          <div className="px-6 py-4">
            <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />
          </div>
        )}

        <div className="flex-grow overflow-y-auto px-6 pb-6">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  )
}
