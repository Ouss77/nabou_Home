"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, Calendar, DollarSign, ImageIcon, Clock } from "lucide-react"
import { StoreSetupWizard } from "@/components/store-setup-wizard"
import type { Store as StoreType } from "@/lib/db" // Corrected import for Store type
import { useLanguage } from "@/components/language-provider"
import { BarberStatusSelector } from "./barber-status-selector"
import { ServiceManagementDialog } from "./service-management-dialog"
import { BlockTimeDialog } from "./block-time-dialog"
import { ImageGallery } from "./image-gallery"
import { WorkingHoursDebug } from "./working-hours-debug"
import { AppointmentCalendar } from "./appointment-calendar"
import { AnalyticsDashboard } from "./analytics-dashboard"

interface BarberDashboardProps {
  barberId: string
  initialStore: StoreType | null
  initialServices: any[] // Consider defining a proper type for services
  initialAppointments: any[] // Consider defining a proper type for appointments
  initialBlockedTimes: any[] // Consider defining a proper type for blocked times
  initialWorkingHours: any[] // Consider defining a proper type for working hours
  initialStoreImages: any[] // Consider defining a proper type for store images
  barberStatus: "trial" | "active" | "expired"
}

export function BarberDashboard({
  barberId,
  initialStore,
  initialServices,
  initialAppointments,
  initialBlockedTimes,
  initialWorkingHours,
  initialStoreImages,
  barberStatus,
}: BarberDashboardProps) {
  const { t } = useLanguage()
  const [store, setStore] = useState<StoreType | null>(initialStore)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [services, setServices] = useState(initialServices)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [blockedTimes, setBlockedTimes] = useState(initialBlockedTimes)
  const [workingHours, setWorkingHours] = useState(initialWorkingHours)
  const [storeImages, setStoreImages] = useState(initialStoreImages)

  useEffect(() => {
    setStore(initialStore)
    setServices(initialServices)
    setAppointments(initialAppointments)
    setBlockedTimes(initialBlockedTimes)
    setWorkingHours(initialWorkingHours)
    setStoreImages(initialStoreImages)
  }, [initialStore, initialServices, initialAppointments, initialBlockedTimes, initialWorkingHours, initialStoreImages])

  const handleStoreCreated = (newStore: StoreType) => {
    setStore(newStore)
    setIsWizardOpen(false)
  }

  const handleServicesUpdated = (updatedServices: any[]) => {
    setServices(updatedServices)
  }

  const handleBlockedTimesUpdated = (updatedBlockedTimes: any[]) => {
    setBlockedTimes(updatedBlockedTimes)
  }

  const handleWorkingHoursUpdated = (updatedWorkingHours: any[]) => {
    setWorkingHours(updatedWorkingHours)
  }

  const handleStoreImagesUpdated = (updatedImages: any[]) => {
    setStoreImages(updatedImages)
  }

  const handleAppointmentStatusChange = (updatedAppointment: any) => {
    setAppointments((prev) => prev.map((apt) => (apt.id === updatedAppointment.id ? updatedAppointment : apt)))
  }

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <Store className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4 text-2xl">{t.barberDashboard.noStoreTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t.barberDashboard.noStoreDescription}</p>
            <Button onClick={() => setIsWizardOpen(true)} className="mt-6 w-full">
              {t.barberDashboard.createStoreButton}
            </Button>
          </CardContent>
        </Card>
        <StoreSetupWizard
          barberId={barberId}
          isOpen={isWizardOpen}
          onOpenChange={setIsWizardOpen}
          onStoreCreated={handleStoreCreated}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <h1 className="text-lg font-semibold md:text-2xl">{t.barberDashboard.dashboardTitle}</h1>
        <div className="ml-auto flex items-center gap-4">
          <BarberStatusSelector currentStatus={barberStatus} barberId={barberId} />
        </div>
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="sm:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>{store.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{store.address}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{store.description}</p>
                <Button variant="outline" className="mt-4 w-full bg-transparent" onClick={() => setIsWizardOpen(true)}>
                  {t.barberDashboard.editStoreButton}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{t.barberDashboard.workingHours}</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkingHoursDebug storeId={store.id} initialWorkingHours={initialWorkingHours} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{t.barberDashboard.services}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {services.length} {t.barberDashboard.servicesOffered}
                </p>
                <ServiceManagementDialog
                  storeId={store.id}
                  initialServices={initialServices}
                  onServicesUpdated={handleServicesUpdated}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{t.barberDashboard.storeImages}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {storeImages.length} {t.barberDashboard.imagesUploaded}
                </p>
                <ImageGallery
                  storeId={store.id}
                  initialImages={initialStoreImages}
                  onImagesUpdated={handleStoreImagesUpdated}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{t.barberDashboard.blockedTimes}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {blockedTimes.length} {t.barberDashboard.blockedPeriods}
                </p>
                <BlockTimeDialog
                  storeId={store.id}
                  initialBlockedTimes={initialBlockedTimes}
                  onBlockedTimesUpdated={handleBlockedTimesUpdated}
                />
              </CardContent>
            </Card>
          </div>
          <AnalyticsDashboard storeId={store.id} />
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-8">
          <AppointmentCalendar
            storeId={store.id}
            initialAppointments={initialAppointments}
            onAppointmentStatusChange={handleAppointmentStatusChange}
          />
        </div>
      </main>
      <StoreSetupWizard
        barberId={barberId}
        isOpen={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onStoreCreated={handleStoreCreated}
        initialStore={store}
      />
    </div>
  )
}
