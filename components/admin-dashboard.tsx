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
import { useLanguage } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"
import { formatCurrency } from "@/lib/currency-utils"

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
  status: "trial" | "active" | "expired"
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

function StatusBadge({ status }: { status: "trial" | "active" | "expired" }) {
  const colorMap = {
    trial: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
  }

  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${colorMap[status]}`}>
      {status}
    </span>
  )
}
export function AdminDashboard({ user, barbers: initialBarbers, appointments }: AdminDashboardProps) {

  const { t, language } = useLanguage()
  const [barbers, setBarbers] = useState(initialBarbers) // ← now barbers is reactive
  const [showCreateBarber, setShowCreateBarber] = useState(false)
  const router = useRouter()
  
const handleStatusChange = async (barberId: string, newStatus: "trial" | "active" | "expired") => {
  const updated = barbers.map((barber) =>
    barber.id === barberId ? { ...barber, status: newStatus } : barber
  )
  setBarbers(updated)

  // ✅ Correct URL here
  const response = await fetch(`/api/admin/barbers/${barberId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  })

  if (!response.ok) {
    console.error("Failed to update barber status:", await response.json())
  }
}


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
            <Badge variant="secondary">{t.nav.admin}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {t.admin.welcome}, {user.name}
            </span>
            <LanguageSelector />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {t.nav.logout}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.admin.totalBarbers}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{barbers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.admin.totalAppointments}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.admin.todayAppointments}</CardTitle>
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
            <TabsTrigger value="barbers">{t.admin.barbers}</TabsTrigger>
            <TabsTrigger value="appointments">{t.admin.allAppointments}</TabsTrigger>
          </TabsList>

          <TabsContent value="barbers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t.admin.barbers}</CardTitle>
                    <CardDescription>{t.admin.manageBarbers}</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateBarber(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.admin.addBarber}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.admin.name}</TableHead>
                      <TableHead>{t.auth.email}</TableHead>
                      <TableHead>{t.admin.appointments}</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>{t.admin.joined}</TableHead>
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
<TableCell>
<select
  value={barber.status}
  onChange={(e) => handleStatusChange(barber.id, e.target.value as "trial" | "active" | "expired")}
  className={`
    text-xs font-medium rounded px-2 py-1
    ${barber.status === "trial" && "bg-yellow-100 text-yellow-800"}
    ${barber.status === "active" && "bg-green-100 text-green-800"}
    ${barber.status === "expired" && "bg-red-100 text-red-800"}
  `}
>
  <option value="trial" className="bg-yellow-100 text-yellow-800">Trial</option>
  <option value="active" className="bg-green-100 text-green-800">Active</option>
  <option value="expired" className="bg-red-100 text-red-800">Expired</option>
</select>

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
                <CardTitle>{t.admin.allAppointments}</CardTitle>
                <CardDescription>{t.admin.viewStatistics}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.admin.client}</TableHead>
                      <TableHead>{t.nav.barber}</TableHead>
                      <TableHead>{t.booking.service}</TableHead>
                      <TableHead>{t.booking.date}</TableHead>
                      <TableHead>{t.booking.time}</TableHead>
                      <TableHead>{t.admin.status}</TableHead>
                      <TableHead>{t.booking.price}</TableHead>
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
                            {appointment.status === "confirmed" ? t.admin.confirmed : t.admin.pending}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(appointment.service_price, language)}</TableCell>
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
