"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateBarberDialog } from "./create-barber-dialog"
import { BarberStatusSelector } from "./barber-status-selector"
import { Users, Calendar, RefreshCw, UserCheck, UserX, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Barber {
  id: string
  email: string
  name: string
  status: "trial" | "active" | "expired"
  created_at: string
  appointment_count: number
}

interface Appointment {
  id: string
  client_name: string
  client_email: string
  appointment_date: string
  appointment_time: string
  status: string
  service_name: string
  service_price: number
  store_title: string
  barber_name: string
}

export function AdminDashboard() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateBarber, setShowCreateBarber] = useState(false)
  const { toast } = useToast()

  const fetchData = async (showRefreshToast = false) => {
    try {
      setRefreshing(true)

      const [barbersRes, appointmentsRes] = await Promise.all([
        fetch("/api/admin/barbers"),
        fetch("/api/admin/appointments"),
      ])

      if (!barbersRes.ok || !appointmentsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const barbersData = await barbersRes.json()
      const appointmentsData = await appointmentsRes.json()

      setBarbers(barbersData)
      setAppointments(appointmentsData)

      if (showRefreshToast) {
        toast({
          title: "Data Refreshed",
          description: "Dashboard data has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleBarberCreated = () => {
    fetchData()
    setShowCreateBarber(false)
  }

  const handleStatusChange = (barberId: string, newStatus: "trial" | "active" | "expired") => {
    setBarbers((prev) => prev.map((barber) => (barber.id === barberId ? { ...barber, status: newStatus } : barber)))
  }

  // Calculate statistics
  const totalBarbers = barbers.length
  const totalAppointments = appointments.length
  const activeBarbers = barbers.filter((b) => b.status === "active").length
  const trialBarbers = barbers.filter((b) => b.status === "trial").length
  const expiredBarbers = barbers.filter((b) => b.status === "expired").length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage barbers and monitor appointments</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => fetchData(true)} variant="outline" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateBarber(true)}>Add Barber</Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barbers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBarbers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Barbers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeBarbers}</div>
            <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
              Active
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Barbers</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{trialBarbers}</div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-1">
              Trial
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Barbers</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredBarbers}</div>
            <Badge variant="destructive" className="bg-red-100 text-red-800 mt-1">
              Expired
            </Badge>
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
      </div>

      {/* Barbers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Barbers Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                        currentStatus={barber.status}
                        onStatusChange={(newStatus) => handleStatusChange(barber.id, newStatus)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{barber.appointment_count}</span>
                        {barber.status === "trial" && barber.appointment_count > 15 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Near Limit
                          </Badge>
                        )}
                        {barber.status === "trial" && barber.appointment_count > 20 && (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            Limit Exceeded
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(barber.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {barbers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No barbers found. Create your first barber to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                        <div className="text-sm text-gray-500">{appointment.client_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.barber_name}</TableCell>
                    <TableCell>{appointment.store_title}</TableCell>
                    <TableCell>{appointment.service_name}</TableCell>
                    <TableCell>
                      <div>
                        <div>{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          appointment.status === "confirmed"
                            ? "default"
                            : appointment.status === "pending"
                              ? "secondary"
                              : appointment.status === "cancelled"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${appointment.service_price?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {appointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CreateBarberDialog open={showCreateBarber} onOpenChange={setShowCreateBarber} onSuccess={handleBarberCreated} />
    </div>
  )
}
