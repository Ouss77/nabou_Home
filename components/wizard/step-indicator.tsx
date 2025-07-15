import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mt-4 flex justify-between">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              currentStep > index + 1
                ? "border-primary bg-primary text-primary-foreground"
                : currentStep === index + 1
                  ? "border-primary bg-background text-primary"
                  : "border-muted-foreground text-muted-foreground",
            )}
          >
            {currentStep > index + 1 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          <span
            className={cn(
              "mt-2 text-xs",
              currentStep >= index + 1 ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            Step {index + 1}
          </span>
        </div>
      ))}
    </div>
  )
}
