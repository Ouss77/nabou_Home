"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Step1StoreInfo } from "./wizard/step1-store-info"
import { Step2Services } from "./wizard/step2-services"
import { Step3WorkingHours } from "./wizard/step3-working-hours"
import { Step4Images } from "./wizard/step4-images"
import { Step5Confirmation } from "./wizard/step5-confirmation"
import { StepIndicator } from "./wizard/step-indicator"
import type { Store } from "@/lib/db" // Import Store type

interface StoreSetupWizardProps {
  barberId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onStoreCreated: (store: Store) => void
  initialStore?: Store | null
}

export function StoreSetupWizard({
  barberId,
  isOpen,
  onOpenChange,
  onStoreCreated,
  initialStore,
}: StoreSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [storeData, setStoreData] = useState<Partial<Store>>({})
  const [createdStore, setCreatedStore] = useState<Store | null>(null)

  useEffect(() => {
    if (initialStore) {
      setStoreData(initialStore)
    } else {
      setStoreData({}) // Clear data if no initial store
    }
    setCurrentStep(1) // Always start at step 1 when opened
    setCreatedStore(null) // Clear created store on open
  }, [isOpen, initialStore])

  const totalSteps = 5

  const handleNext = (data: any) => {
    setStoreData((prev) => ({ ...prev, ...data }))
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleFinish = (store: Store) => {
    setCreatedStore(store)
    onStoreCreated(store)
    setCurrentStep(totalSteps) // Move to confirmation step
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset wizard state when closed
    setCurrentStep(1)
    setStoreData({})
    setCreatedStore(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialStore ? "Edit Your Store" : "Set Up Your Store"}
          </DialogTitle>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-4 h-2" />
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        </DialogHeader>
        <div className="py-4">
          {currentStep === 1 && (
            <Step1StoreInfo
              barberId={barberId}
              initialData={storeData as Store}
              onNext={handleNext}
              isEditing={!!initialStore}
            />
          )}
          {currentStep === 2 && storeData.id && (
            <Step2Services storeId={storeData.id} onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 3 && storeData.id && (
            <Step3WorkingHours storeId={storeData.id} onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 4 && storeData.id && (
            <Step4Images storeId={storeData.id} onFinish={handleFinish} onBack={handleBack} />
          )}
          {currentStep === 5 && createdStore && <Step5Confirmation store={createdStore} onClose={handleClose} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
