"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Calendar, TrendingUp, Users, DollarSign, Clock, RefreshCw } from "lucide-react"

interface Appointment {
  id: string
  service_id: string
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

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration_minutes: number
}

interface AnalyticsDashboardProps {
  appointments: Appointment[]
  services: Service[]
  storeId: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function AnalyticsDashboard({ appointments, services, storeId }: AnalyticsDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      // In a real implementation, this would refetch the data
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Failed to refresh analytics data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const completedAppointments = appointments.filter((apt) => apt.status === "completed")
    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + apt.service_price, 0)

    // Daily revenue data for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    const dailyRevenue = last30Days.map((date) => {
      const dayAppointments = completedAppointments.filter((apt) => apt.appointment_date.startsWith(date))
      const revenue = dayAppointments.reduce((sum, apt) => sum + apt.service_price, 0)
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue,
        appointments: dayAppointments.length,
      }
    })

    // Service performance
    const servicePerformance = services.map((service) => {
      const serviceAppointments = completedAppointments.filter((apt) => apt.service_id === service.id)
      const revenue = serviceAppointments.reduce((sum, apt) => sum + apt.service_price, 0)
      return {
        name: service.name,
        appointments: serviceAppointments.length,
        revenue,
        avgPrice: serviceAppointments.length > 0 ? revenue / serviceAppointments.length : 0,
      }
    })

    // Status distribution
    const statusDistribution = [
      { name: "Completed", value: appointments.filter((apt) => apt.status === "completed").length },
      { name: "Confirmed", value: appointments.filter((apt) => apt.status === "confirmed").length },
      { name: "Pending", value: appointments.filter((apt) => apt.status === "pending").length },
      { name: "Cancelled", value: appointments.filter((apt) => apt.status === "cancelled").length },
    ].filter((item) => item.value > 0)

    // Client age demographics
    const ageGroups = appointments
      .filter((apt) => apt.age)
      .reduce(
        (acc, apt) => {
          const age = apt.age!
          if (age < 18) acc["Under 18"]++
          else if (age < 30) acc["18-29"]++
          else if (age < 45) acc["30-44"]++
          else if (age < 60) acc["45-59"]++
          else acc["60+"]++
          return acc
        },
        { "Under 18": 0, "18-29": 0, "30-44": 0, "45-59": 0, "60+": 0 } as Record<string, number>,
      )

    const ageDistribution = Object.entries(ageGroups)
      .filter(([_, count]) => count > 0)
      .map(([age, count]) => ({ name: age, value: count }))

    // Monthly comparison
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthAppointments = completedAppointments.filter((apt) => {
      const date = new Date(apt.appointment_date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const lastMonthAppointments = completedAppointments.filter((apt) => {
      const date = new Date(apt.appointment_date)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    })

    const currentMonthRevenue = currentMonthAppointments.reduce((sum, apt) => sum + apt.service_price, 0)
    const lastMonthRevenue = lastMonthAppointments.reduce((sum, apt) => sum + apt.service_price, 0)

    return {
      totalRevenue,
      totalAppointments: appointments.length,
      completedAppointments: completedAppointments.length,
      dailyRevenue,
      servicePerformance,
      statusDistribution,
      ageDistribution,
      monthlyComparison: {
        current: { appointments: currentMonthAppointments.length, revenue: currentMonthRevenue },
        last: { appointments: lastMonthAppointments.length, revenue: lastMonthRevenue },
      },
    }
  }, [appointments, services])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your business performance • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{analyticsData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalAppointments > 0
                ? Math.round((analyticsData.completedAppointments / analyticsData.totalAppointments) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Appointments completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €
              {analyticsData.dailyRevenue.length > 0
                ? (
                    analyticsData.dailyRevenue.reduce((sum, day) => sum + day.revenue, 0) /
                    analyticsData.dailyRevenue.length
                  ).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="services">Service Performance</TabsTrigger>
          <TabsTrigger value="status">Appointment Status</TabsTrigger>
          <TabsTrigger value="demographics">Client Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue (Last 30 Days)</CardTitle>
              <CardDescription>Track your daily earnings and appointment volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? `€${value}` : value,
                      name === "revenue" ? "Revenue" : "Appointments",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue (€)" />
                  <Line type="monotone" dataKey="appointments" stroke="#82ca9d" name="Appointments" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>This Month vs Last Month</CardTitle>
                <CardDescription>Monthly performance comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Appointments</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{analyticsData.monthlyComparison.current.appointments}</Badge>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <Badge variant="secondary">{analyticsData.monthlyComparison.last.appointments}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">€{analyticsData.monthlyComparison.current.revenue.toFixed(2)}</Badge>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <Badge variant="secondary">€{analyticsData.monthlyComparison.last.revenue.toFixed(2)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Month-over-month growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Appointment Growth</span>
                  <Badge
                    variant={
                      analyticsData.monthlyComparison.current.appointments >=
                      analyticsData.monthlyComparison.last.appointments
                        ? "default"
                        : "destructive"
                    }
                  >
                    {analyticsData.monthlyComparison.last.appointments > 0
                      ? (
                          ((analyticsData.monthlyComparison.current.appointments -
                            analyticsData.monthlyComparison.last.appointments) /
                            analyticsData.monthlyComparison.last.appointments) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <Badge
                    variant={
                      analyticsData.monthlyComparison.current.revenue >= analyticsData.monthlyComparison.last.revenue
                        ? "default"
                        : "destructive"
                    }
                  >
                    {analyticsData.monthlyComparison.last.revenue > 0
                      ? (
                          ((analyticsData.monthlyComparison.current.revenue -
                            analyticsData.monthlyComparison.last.revenue) /
                            analyticsData.monthlyComparison.last.revenue) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Revenue and booking volume by service type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.servicePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [name === "revenue" ? `€${value}` : value, name]} />
                  <Legend />
                  <Bar dataKey="appointments" fill="#8884d8" name="Appointments" />
                  <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (€)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Status Distribution</CardTitle>
              <CardDescription>Breakdown of appointment statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Age Demographics</CardTitle>
              <CardDescription>Age distribution of your clients</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.ageDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Clients" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No age data available</p>
                    <p className="text-sm">Age demographics will appear when clients provide their age information</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
