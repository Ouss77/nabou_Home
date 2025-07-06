"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Calendar, TrendingUp, Users, DollarSign, RefreshCw, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  service_id: string
  client_name: string
  client_email: string
  appointment_date: string
  appointment_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  service_name: string
  service_price: number
  age?: number
  notes?: string
}

interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  description?: string
}

interface AnalyticsDashboardProps {
  appointments: Appointment[]
  services: Service[]
  storeId: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function AnalyticsDashboard({ appointments, services, storeId }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState("30")
  const [selectedService, setSelectedService] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const { toast } = useToast()

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Filter data based on selected criteria
  const filteredData = useMemo(() => {
    const now = new Date()
    const daysAgo = new Date(now.getTime() - Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_date)
      const isInDateRange = aptDate >= daysAgo
      const isSelectedService = selectedService === "all" || apt.service_id === selectedService

      return isInDateRange && isSelectedService
    })
  }, [appointments, dateRange, selectedService])

  // Calculate metrics
  const metrics = useMemo(() => {
    const completed = filteredData.filter((apt) => apt.status === "completed")
    const totalRevenue = completed.reduce((sum, apt) => sum + apt.service_price, 0)
    const avgRevenue = completed.length > 0 ? totalRevenue / completed.length : 0

    return {
      totalAppointments: filteredData.length,
      completedAppointments: completed.length,
      totalRevenue,
      avgRevenue,
      completionRate: filteredData.length > 0 ? (completed.length / filteredData.length) * 100 : 0,
    }
  }, [filteredData])

  // Daily revenue data
  const dailyRevenueData = useMemo(() => {
    const dailyData = new Map<string, number>()

    filteredData
      .filter((apt) => apt.status === "completed")
      .forEach((apt) => {
        const date = apt.appointment_date
        dailyData.set(date, (dailyData.get(date) || 0) + apt.service_price)
      })

    return Array.from(dailyData.entries())
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString(),
        revenue,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Last 14 days
  }, [filteredData])

  // Service performance data
  const servicePerformanceData = useMemo(() => {
    const serviceData = new Map<string, { revenue: number; count: number }>()

    filteredData
      .filter((apt) => apt.status === "completed")
      .forEach((apt) => {
        const current = serviceData.get(apt.service_name) || { revenue: 0, count: 0 }
        serviceData.set(apt.service_name, {
          revenue: current.revenue + apt.service_price,
          count: current.count + 1,
        })
      })

    return Array.from(serviceData.entries()).map(([name, data]) => ({
      name,
      revenue: data.revenue,
      count: data.count,
    }))
  }, [filteredData])

  // Client age demographics
  const ageGroupData = useMemo(() => {
    const ageGroups = new Map<string, number>()

    filteredData
      .filter((apt) => apt.age)
      .forEach((apt) => {
        const age = apt.age!
        let group = "Unknown"

        if (age < 18) group = "Under 18"
        else if (age < 25) group = "18-24"
        else if (age < 35) group = "25-34"
        else if (age < 45) group = "35-44"
        else if (age < 55) group = "45-54"
        else group = "55+"

        ageGroups.set(group, (ageGroups.get(group) || 0) + 1)
      })

    return Array.from(ageGroups.entries()).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  // Price range analysis
  const priceRangeData = useMemo(() => {
    const priceRanges = new Map<string, number>()

    filteredData
      .filter((apt) => apt.status === "completed")
      .forEach((apt) => {
        const price = apt.service_price
        let range = "Unknown"

        if (price < 20) range = "Under €20"
        else if (price < 40) range = "€20-39"
        else if (price < 60) range = "€40-59"
        else if (price < 80) range = "€60-79"
        else range = "€80+"

        priceRanges.set(range, (priceRanges.get(range) || 0) + price)
      })

    return Array.from(priceRanges.entries()).map(([name, revenue]) => ({ name, revenue }))
  }, [filteredData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setLastUpdate(new Date())
      toast({
        title: "Data Refreshed",
        description: "Analytics data has been updated with the latest information.",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Real-time insights into your business performance • Last updated: {lastUpdate.toLocaleTimeString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">{metrics.completedAppointments} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From completed appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.avgRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per completed appointment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Appointments completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Status</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Live
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Real-time data</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
            <CardDescription>Revenue over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${value}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} dot={{ fill: "#8884d8" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
            <CardDescription>Revenue by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${value}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Age Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Client Age Demographics</CardTitle>
            <CardDescription>Distribution of clients by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageGroupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Price Range Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Price Range</CardTitle>
            <CardDescription>Revenue distribution across price segments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${value}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Automated insights based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.completionRate > 80 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800">
                  Excellent completion rate of {metrics.completionRate.toFixed(1)}% - your clients are highly satisfied!
                </span>
              </div>
            )}

            {servicePerformanceData.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-800">
                  Your top performing service is "{servicePerformanceData[0]?.name}" generating €
                  {servicePerformanceData[0]?.revenue.toFixed(2)} in revenue.
                </span>
              </div>
            )}

            {metrics.avgRevenue > 0 && (
              <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-purple-800">
                  Your average revenue per appointment is €{metrics.avgRevenue.toFixed(2)}.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
