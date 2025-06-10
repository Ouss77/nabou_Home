"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Calendar, Plus, LogOut, Scissors } from "lucide-react"
import { CreateBarberDialog } from "@/components/create-barber-dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface Barber {
  id: string
  email: string
  name: string
  created_at: string
  appointment_count: number
}

interface Appointment {
  id: string
  client_name: string
  client_email: string
  appointment_date: string
  appointment_time: string
  service_name: string
  service_price: number
  store_title: string
  barber_name: string
  status: string
}

interface AdminDashboardProps {
  user: User
  barbers: Barber[]
  appointments: Appointment[]
}

export function AdminDashboard({ user, barbers, appointments }: AdminDashboardProps) {
  const [showCreateBarber, setShowCreateBarber] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const totalAppointments = appointments.length
  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === new Date().toISOString().split("T")[0],
  ).length

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
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Barbers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{barbers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="barbers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="barbers">Barbers</TabsTrigger>
            <TabsTrigger value="appointments">All Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="barbers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Barbers</CardTitle>
                    <CardDescription>Manage barber accounts and view their statistics</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateBarber(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Barber
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {barbers.map((barber) => (
                      <TableRow key={barber.id}>
                        <TableCell className="font-medium">{barber.name}</TableCell>
                        <TableCell>{barber.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{barber.appointment_count}</Badge>
                        </TableCell>
                        <TableCell>{new Date(barber.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>View all appointments across all barbers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Barber</TableHead>
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
                        <TableCell>
                          <div>
                            <div className="font-medium">{appointment.barber_name}</div>
                            <div className="text-sm text-muted-foreground">{appointment.store_title}</div>
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
        </Tabs>
      </div>

      <CreateBarberDialog
        open={showCreateBarber}
        onOpenChange={setShowCreateBarber}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
