"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Store, Users, LogOut, Scissors, Plus, ExternalLink, Settings } from "lucide-react"
import { StoreSetupDialog } from "@/components/store-setup-dialog"
import { ServiceManagementDialog } from "@/components/service-management-dialog"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

interface Appointment {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  appointment_date: string
  appointment_time: string
  service_name: string
  service_price: number
  status: string
  notes: string
}

interface BarberDashboardProps {
  user: User
  store: StoreProps | null
  services: Service[]
  appointments: Appointment[]
}

export function BarberDashboard({ user, store, services, appointments }: BarberDashboardProps) {
  const [showStoreSetup, setShowStoreSetup] = useState(false)
  const [showServiceManagement, setShowServiceManagement] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === new Date().toISOString().split("T")[0],
  ).length

  const totalRevenue = appointments
    .filter((apt) => apt.status === "completed")
    .reduce((sum, apt) => sum + apt.service_price, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Scissors className="h-8 w-8 text-slate-800" />
              <span className="text-2xl font-bold text-slate-800">BarberBook</span>
            </Link>
            <Badge variant="secondary">Barber</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user.name}</span>
            {store && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/book/${store.id}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Public Page
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {!store ? (
          // Store Setup Required
          <div className="max-w-2xl mx-auto text-center py-12">
            <Store className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Set Up Your Store</h2>
            <p className="text-slate-600 mb-6">Create your barbershop profile to start accepting appointments</p>
            <Button onClick={() => setShowStoreSetup(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Store
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayAppointments}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appointments.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Services</CardTitle>
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{services.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="appointments" className="space-y-6">
              <TabsList>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="store">Store Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>View and manage your upcoming appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{appointment.client_name}</div>
                                <div className="text-sm text-muted-foreground">{appointment.client_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{appointment.service_name}</TableCell>
                            <TableCell>{new Date(appointment.appointment_date).toLocaleDateString()}</TableCell>
                            <TableCell>{appointment.appointment_time}</TableCell>
                            <TableCell>
                              <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>${appointment.service_price}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Calendar</CardTitle>
                    <CardDescription>View your appointments in calendar format</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AppointmentCalendar appointments={appointments} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="store">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Store Information</CardTitle>
                          <CardDescription>Manage your store details and settings</CardDescription>
                        </div>
                        <Button onClick={() => setShowStoreSetup(true)} variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Store
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

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Services</CardTitle>
                          <CardDescription>Manage your services and pricing</CardDescription>
                        </div>
                        <Button onClick={() => setShowServiceManagement(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Manage Services
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
                              <p className="text-sm text-muted-foreground">{service.duration_minutes} minutes</p>
                            </div>
                            <div className="text-lg font-bold">${service.price}</div>
                          </div>
                        ))}
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
        onSuccess={() => router.refresh()}
      />

      {store && (
        <ServiceManagementDialog
          open={showServiceManagement}
          onOpenChange={setShowServiceManagement}
          storeId={store.id}
          services={services}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
