interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = stepNumber < currentStep

        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                  ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`mx-4 h-0.5 w-12 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
