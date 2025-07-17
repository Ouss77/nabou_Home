"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Store,
  Users,
  LogOut,
  Scissors,
  Plus,
  ExternalLink,
  Settings,
  Clock,
  Copy,
  RefreshCw,
} from "lucide-react"
import { StoreSetupDialog } from "@/components/store-setup-dialog"
import { ServiceManagementDialog } from "@/components/service-management-dialog"
import { BlockTimeDialog } from "@/components/block-time-dialog"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { ImageUpload } from "@/components/image-upload"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { AppointmentStatusSelector } from "@/components/appointment-status-selector"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/currency-utils"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface StoreProps {
  id: string
  title: string
  address: string
  description: string
  image_url: string
  slug?: string
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

interface Appointment {
  service_id: string
  id: string
  client_name: string
  client_email: string
  client_phone: string
  appointment_date: string
  appointment_time: string
  service_name: string
  service_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes: string
  age?: number
}

interface BlockedTime {
  id: string
  store_id: string
  blocked_date: string
  start_time: string
  end_time: string
  reason: string | null
  created_at: string
}

interface WorkingHours {
  id: string
  store_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_closed: boolean
  created_at: string
  updated_at: string
}

interface StoreImage {
  id: string
  store_id: string
  image_data: string
  image_name: string
  image_type: string
  image_size: number
  is_primary: boolean
  created_at: string
}

interface BarberDashboardProps {
  user: User
  storeId: string
  store: StoreProps | null
  services: Service[]
  appointments: Appointment[]
  workingHours: WorkingHours[]
}

export function BarberDashboard({
  user,
  store,
  storeId,
  services: initialServices,
  appointments: initialAppointments,
  workingHours,
}: BarberDashboardProps) {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const [showStoreSetup, setShowStoreSetup] = useState(false)
  const [showServiceManagement, setShowServiceManagement] = useState(false)
  const [showBlockTime, setShowBlockTime] = useState(false)
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([])
  const [storeImages, setStoreImages] = useState<StoreImage[]>([])
  const [loadingBlockedTimes, setLoadingBlockedTimes] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [services, setServices] = useState<Service[]>(initialServices)
  const [lastDataUpdate, setLastDataUpdate] = useState<Date>(new Date())
  const [data, setData] = useState({ appointments: [], services: [] })
  const [isRefreshing, setIsRefreshing] = useState(false)
const [activeTab, setActiveTab] = useState<"basic" | "images" | "hours">("basic")

  const router = useRouter()

  // Fetch blocked times and images when store is available
  useEffect(() => {
    if (store?.id) {
      fetchBlockedTimes()
      fetchStoreImages()
    }
  }, [store?.id])

  useEffect(() => {
    if (storeId && store?.id) {
      fetch(`/api/analytics/${storeId}`)
        .then((res) => res.json())
        .then(setData)
        .catch(console.error)
    }
  }, [storeId, store?.id])

  const refreshDashboardData = useCallback(async () => {
    if (!store?.id) return

    setIsRefreshing(true)
    try {
      // Refresh appointments data
      const appointmentsResponse = await fetch(`/api/barber/appointments?storeId=${store.id}`)
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData)
      }

      // Refresh analytics data
      const analyticsResponse = await fetch(`/api/analytics/${store.id}`)
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setData(analyticsData)
      }

      setLastDataUpdate(new Date())

      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated with the latest information.",
      })
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [store?.id, toast])

  const handleStatusChange = (
    appointmentId: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed",
  ) => {
    // Optimistically update the local state
    setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt)))

    // Update the last data update timestamp
    setLastDataUpdate(new Date())
  }

  const fetchBlockedTimes = async () => {
    if (!store?.id) return

    setLoadingBlockedTimes(true)
    try {
      const response = await fetch(`/api/barber/blocked-times?storeId=${store.id}`)
      const data = await response.json()
      if (response.ok) {
        setBlockedTimes(data.blockedTimes || [])
      }
    } catch (error) {
      console.error("Failed to fetch blocked times:", error)
    } finally {
      setLoadingBlockedTimes(false)
    }
  }

  const fetchStoreImages = async () => {
    if (!store?.id) return

    setLoadingImages(true)
    try {
      const response = await fetch(`/api/barber/store-images?storeId=${store.id}`)
      const data = await response.json()
      if (response.ok) {
        setStoreImages(data.images || [])
      }
    } catch (error) {
      console.error("Failed to fetch store images:", error)
    } finally {
      setLoadingImages(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const handleCopyLink = async () => {
    if (store?.id) {
      const publicPageUrl = `${window.location.origin}/book/${store.slug || store.id}`
      try {
        await navigator.clipboard.writeText(publicPageUrl)
        toast({
          title: t.common?.linkCopied || "Link Copied",
          description: publicPageUrl,
        })
      } catch (err) {
        console.error("Failed to copy link:", err)
        toast({
          title: t.common?.error || "Error",
          description: "Failed to copy link to clipboard.",
          variant: "destructive",
        })
      }
    }
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("fr-CA") // "YYYY-MM-DD" format, locale-safe
  }

  const today = formatDate(new Date())

  const todayAppointments = appointments.filter((apt) => {
    const aptDateStr = formatDate(new Date(apt.appointment_date))
    return aptDateStr === today
  }).length

  const totalRevenue = (appointments: Appointment[], services: Service[]): number => {
    const servicePriceMap = new Map<string, number>(
      services.map((service) => [service.id, Number.parseFloat(service.price.toString())]),
    )

    return appointments
      .filter((apt) => apt.status === "completed")
      .reduce((sum, appointment) => {
        const price = servicePriceMap.get(appointment.service_id) || appointment.service_price || 0
        return sum + price
      }, 0)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-nowrap overflow-x-auto overflow-y-hidden no-scrollbar">
          {/* Left Section - Always in line */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 hover:gap-3 transition-all">
              <Scissors className="h-8 w-8 text-slate-800" />
              <span className="text-2xl font-bold whitespace-nowrap text-slate-800">BarberBook</span>
            </Link>
            <Badge variant="secondary" className="whitespace-nowrap">
              {t.nav?.barber || "Barber"}
            </Badge>
          </div>

          {/* Right Section - Stays in single line whenever possible */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* User greeting - disappears on smallest screens */}
            <span className="text-sm text-slate-600 whitespace-nowrap hidden xs:inline">
              {t.barberDashboard?.welcome || "Welcome"}, <span className="font-medium">{user.name}</span>
            </span>

            {/* Refresh button - only show if store exists */}
            {store && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshDashboardData}
                disabled={isRefreshing}
                className="whitespace-nowrap shrink-0 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}

            {/* Public page and Copy Link buttons - remains compact */}
            {store && (
              <>
                <Button variant="outline" size="sm" asChild className="whitespace-nowrap shrink-0 bg-transparent">
                  <Link href={`/book/${store.slug || store.id}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t.barberDashboard?.viewPublicPage || "View Public Page"}</span>
                    <span className="sm:hidden">Public Page</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="whitespace-nowrap shrink-0 bg-transparent"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t.barberDashboard?.copyLink || "Copy Link"}</span>
                  <span className="sm:hidden">Copy</span>
                </Button>
              </>
            )}

            {/* Logout button - remains compact */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="whitespace-nowrap shrink-0 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t.nav?.logout || "Logout"}</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="p-4 sm:p-6">
        {!store ? (
          // Store Setup Required
          <div className="max-w-2xl mx-auto text-center py-12">
            <Store className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t.barberDashboard?.setUpStore || "Set Up Your Store"}
            </h2>
            <p className="text-slate-600 mb-6">
              {t.barberDashboard?.createProfile || "Create your barber profile to start accepting appointments"}
            </p>
            <Button onClick={() => setShowStoreSetup(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              {t.barberDashboard?.createStore || "Create Store"}
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Cards - Using live data */}
            <div className="hidden md:grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t.barberDashboard?.todayAppointments || "Today's Appointments"}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayAppointments}</div>
                  <p className="text-xs text-muted-foreground">Live count</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t.barberDashboard?.totalAppointments || "Total Appointments"}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appointments.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.barberDashboard?.services || "Services"}</CardTitle>
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.length}</div>
                  <p className="text-xs text-muted-foreground">Active services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t.barberDashboard?.totalRevenue || "Total Revenue"}
                  </CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRevenue(appointments, services)} €</div>
                  <p className="text-xs text-muted-foreground">Completed bookings</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="appointments" className="space-y-6">
              <TabsList>
                <TabsTrigger value="appointments">{t.admin?.appointments || "Appointments"}</TabsTrigger>
                <TabsTrigger value="calendar">
                  {t.barberDashboard?.appointmentCalendar || "Appointment Calendar"}
                </TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="store">{t.barberDashboard?.storeInformation || "Store Information"}</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{t.barberDashboard?.recentAppointments || "Recent Appointments"}</CardTitle>
                        <CardDescription>
                          {t.barberDashboard?.viewManage || "View and manage your appointments"} • Last updated:{" "}
                          {lastDataUpdate.toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={refreshDashboardData} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t.admin?.client || "Client"}</TableHead>
                            <TableHead>{t.booking?.service || "Service"}</TableHead>
                            <TableHead>{t.booking?.date || "Date"}</TableHead>
                            <TableHead>{t.booking?.time || "Time"}</TableHead>
                            <TableHead>{t.admin?.status || "Status"}</TableHead>
                            <TableHead>{t.booking?.price || "Price"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{appointment.client_name}</div>
                                  <div className="text-sm text-muted-foreground">{appointment.client_email}</div>
                                  {appointment.client_phone && (
                                    <div className="text-sm text-muted-foreground">{appointment.client_phone}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{appointment.service_name}</div>
                                  {appointment.notes && (
                                    <div className="text-sm text-muted-foreground">{appointment.notes}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{new Date(appointment.appointment_date).toLocaleDateString()}</TableCell>
                              <TableCell>{appointment.appointment_time}</TableCell>
                              <TableCell>
                                <AppointmentStatusSelector
                                  appointmentId={appointment.id}
                                  currentStatus={appointment.status}
                                  onStatusChange={(newStatus) => handleStatusChange(appointment.id, newStatus)}
                                />
                              </TableCell>
                              <TableCell>{formatCurrency(appointment.service_price, language)}</TableCell>
                            </TableRow>
                          ))}
                          {appointments.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No appointments found. Your upcoming bookings will appear here.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{t.barberDashboard?.appointmentCalendar || "Appointment Calendar"}</CardTitle>
                        <CardDescription>
                          {t.barberDashboard?.calendarFormat || "View appointments in calendar format"}
                        </CardDescription>
                      </div>
                      <Button onClick={() => setShowBlockTime(true)}>
                        <Clock className="h-4 w-4 mr-2" />
                        {t.blockTime?.blockTime || "Block Time"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AppointmentCalendar appointments={appointments} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsDashboard appointments={data.appointments} services={data.services} storeId={storeId} />
              </TabsContent>

              <TabsContent value="store">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{t.barberDashboard?.storeInformation || "Store Information"}</CardTitle>
                          <CardDescription>
                            {t.barberDashboard?.manageStore || "Manage your store details and settings"}
                          </CardDescription>
                        </div>
                        <Button onClick={() => { setActiveTab("basic"); setShowStoreSetup(true); }} variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          {t.barberDashboard?.editStore || "Edit Store"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium">{store.title}</h3>
                          <p className="text-sm text-muted-foreground">{store.address}</p>
                        </div>
                        {store.description && <p className="text-sm">{store.description}</p>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Store Images */}
                  <ImageUpload storeId={store.id} images={storeImages} onImagesChange={fetchStoreImages} />

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{t.barberDashboard?.services || "Services"}</CardTitle>
                          <CardDescription>
                            {t.barberDashboard?.managePricing || "Manage your services and pricing"}
                          </CardDescription>
                        </div>
                        <Button onClick={() => setShowServiceManagement(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          {t.barberDashboard?.manageServices || "Manage Services"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {service.duration_minutes} {t.booking?.minutes || "minutes"}
                              </p>
                            </div>
                            <div className="text-lg font-bold">{formatCurrency(service.price, language)}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Working Hours
                          </CardTitle>
                          <CardDescription>Your business hours for customer bookings</CardDescription>
                        </div>
                          <Button onClick={() => {
                            setShowStoreSetup(true)
                            setActiveTab("hours")  // you'll need a state for this (see below)
                          }} variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Hours
                          </Button>

                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                          (day, index) => {
                            const dayHours = workingHours.find((wh) => wh.day_of_week === index)
                            return (
                              <div key={day} className="flex items-center justify-between p-2 border rounded">
                                <span className="font-medium">{day}</span>
                                <span className="text-sm text-muted-foreground">
                                  {dayHours?.is_closed
                                    ? "Closed"
                                    : `${dayHours?.start_time || "09:00"} - ${dayHours?.end_time || "18:00"}`}
                                </span>
                              </div>
                            )
                          },
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

        <StoreSetupDialog
          open={showStoreSetup}
          onOpenChange={setShowStoreSetup}
          store={store}
          defaultTab={activeTab} // pass the state
          onSuccess={() => {
            router.refresh()
            refreshDashboardData()
          }}
        />


      {store && (
        <>
          <ServiceManagementDialog
            open={showServiceManagement}
            onOpenChange={setShowServiceManagement}
            storeId={store.id}
            services={services}
            onSuccess={() => {
              router.refresh()
              refreshDashboardData()
            }}
          />

          <BlockTimeDialog
            open={showBlockTime}
            onOpenChange={setShowBlockTime}
            storeId={store.id}
            blockedTimes={blockedTimes}
            onSuccess={() => {
              fetchBlockedTimes()
              router.refresh()
              refreshDashboardData()
            }}
          />
        </>
      )}
    </div>
  )
}
