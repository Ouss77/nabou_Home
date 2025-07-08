"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateBarberDialog } from "./create-barber-dialog"
import { BarberStatusSelector } from "./barber-status-selector"
import { Users, Calendar, Store, TrendingUp, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "barber"
  status?: "trial" | "active" | "expired"
  created_at: string
  appointment_count: number
}

interface Appointment {
  id: string
  store_id: string
  service_id: string
  client_name: string
  client_email: string
  client_phone: string | null
  appointment_date: string
  appointment_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes: string | null
  created_at: string
  service_name?: string
  service_price?: number
  store_title?: string
  barber_name?: string
}

interface AdminDashboardProps {
  user: User
  barbers: User[]
  appointments: Appointment[]
}

export function AdminDashboard({ user, barbers: initialBarbers, appointments }: AdminDashboardProps) {
  const [barbers, setBarbers] = useState<User[]>(initialBarbers)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/admin/barbers", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBarbers(data.barbers)
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleStatusUpdate = (barberId: string, newStatus: "trial" | "active" | "expired") => {
    setBarbers((prev) => prev.map((barber) => (barber.id === barberId ? { ...barber, status: newStatus } : barber)))
  }

  const totalBarbers = barbers.length
  const activeBarbers = barbers.filter((b) => b.status === "active").length
  const trialBarbers = barbers.filter((b) => b.status === "trial").length
  const expiredBarbers = barbers.filter((b) => b.status === "expired").length
  const totalAppointments = appointments.length
  const completedAppointments = appointments.filter((a) => a.status === "completed").length
  const totalRevenue = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (a.service_price || 0), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <Button onClick={refreshData} disabled={isRefreshing} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barbers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBarbers}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {activeBarbers} Active
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {trialBarbers} Trial
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {expiredBarbers} Expired
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">{completedAppointments} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBarbers}</div>
            <p className="text-xs text-muted-foreground">Stores with active barbers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed appointments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="barbers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="barbers">Barbers</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="barbers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Barber Management</CardTitle>
                  <CardDescription>Manage barber accounts and their status</CardDescription>
                </div>
                <CreateBarberDialog onBarberCreated={refreshData} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
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
                        <BarberStatusSelector
                          barberId={barber.id}
                          currentStatus={barber.status || "trial"}
                          onStatusUpdate={(newStatus) => handleStatusUpdate(barber.id, newStatus)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{barber.appointment_count} appointments</Badge>
                      </TableCell>
                      <TableCell>{new Date(barber.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>All appointments across all barber shops</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Barber</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.slice(0, 10).map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.client_name}</div>
                          <div className="text-sm text-muted-foreground">{appointment.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.barber_name}</TableCell>
                      <TableCell>{appointment.store_title}</TableCell>
                      <TableCell>{appointment.service_name}</TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">{appointment.appointment_time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            appointment.status === "completed"
                              ? "default"
                              : appointment.status === "confirmed"
                                ? "secondary"
                                : appointment.status === "cancelled"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${appointment.service_price?.toFixed(2) || "0.00"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
