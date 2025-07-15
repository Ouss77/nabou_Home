"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              currentStep > index + 1
                ? "border-primary bg-primary text-primary-foreground"
                : currentStep === index + 1
                  ? "border-primary text-primary"
                  : "border-muted-foreground text-muted-foreground",
            )}
          >
            {currentStep > index + 1 ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          <p
            className={cn(
              "mt-2 text-center text-sm",
              currentStep >= index + 1 ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {step}
          </p>
        </div>
      ))}
    </div>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
