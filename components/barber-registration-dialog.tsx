'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { useLanguage } from '@/components/language-provider'
import { useRouter } from 'next/navigation'

interface BarberRegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BarberRegistrationDialog({
  open,
  onOpenChange,
}: BarberRegistrationDialogProps) {
  const { t } = useLanguage()
  const router = useRouter()

  // State for managing the overall dialog flow (form or success)
  const [dialogStep, setDialogStep] = useState<'form' | 'success'>('form')
  // State for managing the current step within the multi-step form
  const [currentFormStep, setCurrentFormStep] = useState(1) // 1, 2, 3
  // State for showing a loading spinner during API calls or step transitions
  const [loading, setLoading] = useState(false)
  // State for simulating a brief loading/processing time between steps
  const [stepLoading, setStepLoading] = useState(false)
  // State for displaying error messages
  const [error, setError] = useState('')
  // State for email-specific validation
  const [emailError, setEmailError] = useState('')
  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
  })
  // State to store credentials for auto-login after successful registration
  const [registeredCredentials, setRegisteredCredentials] = useState<{
    email: string
    password: string
  } | null>(null)

  // Total number of form steps
  const totalFormSteps = 3

  // Function to validate email specifically
  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  // Function to validate form data for the current step
  const validateCurrentStep = () => {
    setError('') // Clear previous errors
    setEmailError('') // Clear email errors
    switch (currentFormStep) {
      case 1: // Email step
        const emailValidationError = validateEmail(formData.email)
        if (emailValidationError) {
          setEmailError(emailValidationError)
          return emailValidationError
        }
        return null
      case 2: // Name and Password step
        if (!formData.fullName.trim()) {
          return 'Full name is required'
        }
        if (formData.password.length < 6) {
          return 'Password must be at least 6 characters long'
        }
        if (formData.password !== formData.confirmPassword) {
          return 'Passwords do not match'
        }
        return null
      case 3: // Phone and City step
        if (!formData.phone.trim()) {
          return 'Phone number is required'
        }
        if (!formData.city.trim()) {
          return 'City is required'
        }
        return null
      default:
        return null
    }
  }

  // Handle moving to the next step
  const handleNextStep = () => {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }

    setStepLoading(true) // Start step loading animation
    setTimeout(() => {
      if (currentFormStep < totalFormSteps) {
        setCurrentFormStep((prev) => prev + 1)
      }
      setStepLoading(false) // End step loading animation
    }, 700) // Simulate a brief loading time
  }

  // Handle moving to the previous step
  const handlePreviousStep = () => {
    if (currentFormStep > 1) {
      setCurrentFormStep((prev) => prev - 1)
      setError('') // Clear errors when going back
      setEmailError('') // Clear email errors when going back
    }
  }

  // Handle the final form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    const validationError = validateCurrentStep() // Validate all fields one last time
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true) // Start global loading spinner for API call
    try {
      // Simulate API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error('Registration failed')

      setRegisteredCredentials({ email: formData.email, password: formData.password })
      setDialogStep('success') // Move to success screen
    } catch (err) {
      setError('Registration failed')
    } finally {
      setLoading(false) // End global loading spinner
    }
  }

  // Handle closing the dialog and resetting state
  const handleClose = () => {
    setDialogStep('form')
    setCurrentFormStep(1)
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      city: '',
    })
    setRegisteredCredentials(null)
    setError('')
    setEmailError('')
    onOpenChange(false)
  }

  // Handle continuing to the login page after successful registration
  const handleContinueToLogin = () => {
    if (registeredCredentials) {
      sessionStorage.setItem('autoLogin', JSON.stringify(registeredCredentials))
      onOpenChange(false)
      router.push('/login')
    }
  }

  // Calculate progress percentage for the progress bar
  const progressPercentage = (currentFormStep / totalFormSteps) * 100

  // ----- Success Dialog -----
  if (dialogStep === 'success') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md border-2 rounded-xl border-gradient-to-br from-purple-500 to-pink-500">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">
              {t.registration.success}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t.registration.successMessage}
            </DialogDescription>
          </DialogHeader>

          <Button
            onClick={handleContinueToLogin}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
            size="lg"
          >
            {t.registration.continueToLogin}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  // ----- Registration Form (Multi-Step) -----
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-transparent bg-white dark:bg-black shadow-2xl p-[2px] bg-gradient-to-br from-purple-500 to-pink-500">
        <div className="rounded-2xl bg-white dark:bg-black p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t.registration.title}</DialogTitle>
            <DialogDescription>{t.registration.subtitle}</DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="mt-4 mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
              {'Step'} {currentFormStep} {t.registration.of || 'of'} {totalFormSteps}
              {stepLoading && (
                <Loader2 className="inline-block ml-2 h-4 w-4 animate-spin text-purple-500" />
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email-specific alert */}
            {emailError && currentFormStep === 1 && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950">
                <Mail className="h-4 w-4" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {emailError || 'Invalid email address'}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Email */}
            {currentFormStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.registration.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        // Clear email error when user starts typing
                        if (emailError) setEmailError('')
                      }}
                      className={`pl-10 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                      disabled={stepLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Name and Password */}
            {currentFormStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.registration.fullName}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="pl-10"
                      required
                      disabled={stepLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t.registration.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="pl-10"
                        required
                        disabled={stepLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.registration.confirmPassword}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className="pl-10"
                        required
                        disabled={stepLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Check */}
                <div className="text-xs text-gray-600 space-y-1 dark:text-gray-400">
                  <div className="font-medium">{t.registration.passwordRequirements}</div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`h-3 w-3 ${
                        formData.password.length >= 6 ? 'text-green-500' : 'text-gray-300'
                      }`}
                    />
                    <span>{t.registration.passwordMinLength}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`h-3 w-3 ${
                        formData.password && formData.password === formData.confirmPassword
                          ? 'text-green-500'
                          : 'text-gray-300'
                      }`}
                    />
                    <span>
                      {formData.password === formData.confirmPassword
                        ? t.registration.passwordsMatch
                        : t.registration.passwordsDontMatch}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Phone & City */}
            {currentFormStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.registration.phone}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="pl-10"
                        required
                        disabled={stepLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">{t.registration.city}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="city"
                        type="text"
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="pl-10"
                        required
                        disabled={stepLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentFormStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="flex-1"
                  disabled={stepLoading || loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.common.previous || 'Previous'}
                </Button>
              )}

              {currentFormStep < totalFormSteps && (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition"
                  disabled={stepLoading || loading}
                >
                  {stepLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.common.next || 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {currentFormStep === totalFormSteps && (
                <Button
                  type="submit"
                  disabled={loading || stepLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.registration.register}
                </Button>
              )}
            </div>

            {/* Cancel Button (always present) */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={loading || stepLoading}
            >
              {t.common.cancel}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
