"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { StepIndicator } from "./wizard/step-indicator"
import { Step1StoreInfo } from "./wizard/step1-store-info"
import { Step2Activity } from "./wizard/step2-activity"
import { Step3Services } from "./wizard/step3-services"
import { Step4WorkingHours } from "./wizard/step4-working-hours"
import { Step5Images } from "./wizard/step5-images"
import { Step6Confirmation } from "./wizard/step6-confirmation"
import type { Store } from "@/lib/db"

interface StoreSetupWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (store: Store) => void
}

const WIZARD_STEPS = ["Store Info", "Activity", "Services", "Working Hours", "Images", "Complete"]

export function StoreSetupWizard({ open, onOpenChange, onSuccess }: StoreSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [storeData, setStoreData] = useState(null)
  const [tempStoreData, setTempStoreData] = useState(null) // Add temporary storage
  const [selectedActivity, setSelectedActivity] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Reset wizard state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      setStoreData(null)
      setTempStoreData(null)
      setSelectedActivity("")
      setIsLoading(false)
    }
  }, [open])

  // Scroll to top when step changes
  useEffect(() => {
    if (dialogContentRef.current) {
      dialogContentRef.current.scrollTop = 0
    }
  }, [currentStep])

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleStoreInfoNext = (data: any) => {
    setTempStoreData(data) // Store temporarily
    setCurrentStep(2) // Go to activity selection first
  }

  const handleActivitySelect = async (activity: string) => {
    setSelectedActivity(activity)
    
    // Now create the store with both store info and activity
    if (tempStoreData) {
      setIsLoading(true)
      try {
        const response = await fetch("/api/barber/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...tempStoreData,
            activity: activity
          }),
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || "Failed to create store.")
        }

        setStoreData(result.store)
        setCurrentStep(3) // Now go to services with valid storeId
      } catch (error) {
        console.error("Store creation error:", error)
        // Handle error - maybe show toast
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFinish = () => {
    setCurrentStep(6) // Go to confirmation step
  }

  const handleComplete = () => {
    if (storeData) {
      onSuccess(storeData)
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
        return (
          <Step1StoreInfo
            onNext={handleStoreInfoNext}
            initialData={tempStoreData || storeData}
          />
        )
      case 2:
        return (
          <Step2Activity
            onNext={handleActivitySelect}
            onBack={() => setCurrentStep(1)}
          />
        )
      case 3:
        return storeData ? (
          <Step3Services
            storeId={storeData.id}
            selectedActivity={selectedActivity}
            onNext={handleNext}
            onBack={handleBack}
          />
        ) : (
          <div className="text-center p-4">
            <p>Setting up store... Please wait.</p>
          </div>
        )
      case 4:
        return storeData ? <Step4WorkingHours storeId={storeData.id} onNext={handleNext} onBack={handleBack} /> : null
      case 5:
        return storeData ? <Step5Images storeId={storeData.id} onFinish={handleFinish} onBack={handleBack} /> : null
      case 6:
        return storeData ? <Step6Confirmation store={storeData} onComplete={handleComplete} /> : null
      default:
        return <div>Step not found</div>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome! Let's Set Up Your Store</DialogTitle>
          <DialogDescription>
            Follow these steps to create your profile and start accepting appointments.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          <Progress value={(currentStep / WIZARD_STEPS.length) * 100} className="mb-4" />
          <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />
        </div>

        <div ref={dialogContentRef} className="flex-1 overflow-y-auto px-6 pb-6">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  )
}
