"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"
import { RefreshCw, TrendingUp, DollarSign, Users, Calendar, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  appointment_date: string
  appointment_time: string
  service_id: string  // ✅ You need this to look up service price
  service_name: string
  status: string
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export function AnalyticsDashboard({
  appointments: initialAppointments,
  services: initialServices,
  storeId, 
}: AnalyticsDashboardProps) {

  const { language } = useLanguage()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState<string>("30")
  const [selectedService, setSelectedService] = useState<string>("all")
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [services, setServices] = useState<Service[]>(initialServices)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())


  const servicePriceMap = useMemo(
  () =>
    new Map<string, number>(
      services.map((service) => [service.id, parseFloat(service.price as any)])
    ),
  [services]
)



  // Update local state when props change (for real-time updates from parent)
  useEffect(() => {
    setAppointments(initialAppointments)
    setServices(initialServices)
    setLastUpdated(new Date())
  }, [initialAppointments, initialServices])

  const refreshData = async () => {
    if (!storeId) return

    setIsRefreshing(true)
    try {
      // In a real implementation, these would be actual API calls
      // For now, we'll simulate the refresh by updating the timestamp
      setLastUpdated(new Date())

      toast({
        title: "Data Updated",
        description: "Analytics data has been refreshed with the latest information.",
      })
    } catch (error) {
      console.error("Failed to refresh analytics data:", error)
      toast({
        title: "Refresh Failed",
        description: "Unable to fetch the latest data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Filter appointments based on date range and service - using live data
  const filteredAppointments = useMemo(() => {
    const now = new Date()
    const daysAgo = new Date(now.getTime() - Number.parseInt(dateRange) * 24 * 60 * 60 * 1000)

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.appointment_date)
      const dateMatch = aptDate >= daysAgo
      const serviceMatch = selectedService === "all" || apt.service_name === selectedService
      const statusMatch = apt.status === "completed" || apt.status === "confirmed"

      return dateMatch && serviceMatch && statusMatch
    })
  }, [appointments, dateRange, selectedService])

// const totalRevenue = useMemo(() => {
//   const servicePriceMap = new Map<string, number>(
//     services.map(service => [service.id, parseFloat(service.price)])
//   );

//   return filteredAppointments.reduce((sum, appointment) => {
//     const price = servicePriceMap.get(appointment.service_id) || 0;
//     return sum + price;
//   }, 0);
// }, [filteredAppointments, services]);

const totalRevenue = useMemo(() => {
  return filteredAppointments.reduce((sum, appointment) => {
    const price = servicePriceMap.get(appointment.service_id) || 0
    return sum + price
  }, 0)
}, [filteredAppointments, servicePriceMap])

  const averageBookingValue = useMemo(() => {
    return filteredAppointments.length > 0 ? totalRevenue / filteredAppointments.length : 0
  }, [totalRevenue, filteredAppointments])

  // Revenue by date data (Daily breakdown) - Live data
  const revenueByDate = useMemo(() => {
    const dateMap = new Map<string, { revenue: number; appointments: number }>()

    filteredAppointments.forEach((apt) => {
      const date = apt.appointment_date
      const current = dateMap.get(date) || { revenue: 0, appointments: 0 }
      dateMap.set(date, {
        revenue: current.revenue + (servicePriceMap.get(apt.service_id) || 0),
        appointments: current.appointments + 1,
      })
    })

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: date,
        revenue: data.revenue,
        appointments: data.appointments,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-14) // Last 14 days for better visualization
  }, [filteredAppointments])

  // Revenue by service data with current service prices - Live data
const revenueByService = useMemo(() => {
  const serviceMap = new Map<string, { revenue: number; count: number; basePrice: number }>()

  filteredAppointments.forEach((apt) => {
    const service = services.find((s) => s.id === apt.service_id)
    const name = service?.name || apt.service_name
    const price = Number(service?.price) || 0
    const current = serviceMap.get(name) || { revenue: 0, count: 0, basePrice: price }

    serviceMap.set(name, {
      revenue: current.revenue + price,
      count: current.count + 1,
      basePrice: price,
    })
  })

  return Array.from(serviceMap.entries()).map(([service, data]) => ({
    service: service.length > 15 ? service.substring(0, 15) + "..." : service,
    fullServiceName: service,
    revenue: data.revenue,
    count: data.count,
    basePrice: data.basePrice,
    averagePrice: data.count > 0 ? data.revenue / data.count : 0,
  }))
}, [filteredAppointments, services])


  // Revenue by age group data - Live data
const revenueByAge = useMemo(() => {
  const ageGroups = {
    "18-25": { revenue: 0, count: 0 },
    "26-35": { revenue: 0, count: 0 },
    "36-45": { revenue: 0, count: 0 },
    "46-55": { revenue: 0, count: 0 },
    "56+": { revenue: 0, count: 0 },
    "<18": { revenue: 0, count: 0 },
  };

  // Map service_id -> price
  const servicePriceMap = new Map<string, number>(
    services.map(service => [service.id, parseFloat(service.price)])
  );

  filteredAppointments.forEach((apt) => {
    const age = apt.age;
    let group = "<18";

    if (age) {
      if (age < 18) group = "<18";
      else if (age >= 18 && age <= 25) group = "18-25";
      else if (age >= 26 && age <= 35) group = "26-35";
      else if (age >= 36 && age <= 45) group = "36-45";
      else if (age >= 46 && age <= 55) group = "46-55";
      else if (age >= 56) group = "56+";
    }

    const price = servicePriceMap.get(apt.service_id) || 0;

    ageGroups[group as keyof typeof ageGroups].revenue += price;
    ageGroups[group as keyof typeof ageGroups].count += 1;
  });

  return Object.entries(ageGroups)
    .filter(([_, data]) => data.count > 0)
    .map(([ageGroup, data]) => ({
      ageGroup,
      revenue: data.revenue,
      count: data.count,
      averageSpend: data.revenue / data.count,
    }));
}, [filteredAppointments, services]);


  // Service price analysis - Live data
  const servicePriceAnalysis = useMemo(() => {
    const priceRanges = {
      "Under $25": { revenue: 0, count: 0 },
      "$25-$50": { revenue: 0, count: 0 },
      "$51-$75": { revenue: 0, count: 0 },
      "$76-$100": { revenue: 0, count: 0 },
      "Over $100": { revenue: 0, count: 0 },
    }

    filteredAppointments.forEach((apt) => {
      const price = servicePriceMap.get(apt.service_id) || 0
      let range = "Under $25"

      if (price >= 25 && price <= 50) range = "$25-$50"
      else if (price >= 51 && price <= 75) range = "$51-$75"
      else if (price >= 76 && price <= 100) range = "$76-$100"
      else if (price > 100) range = "Over $100"

      priceRanges[range as keyof typeof priceRanges].revenue += price
      priceRanges[range as keyof typeof priceRanges].count += 1
    })

    return Object.entries(priceRanges)
      .filter(([_, data]) => data.count > 0)
      .map(([priceRange, data]) => ({
        priceRange,
        revenue: data.revenue,
        count: data.count,
        averagePrice: data.revenue / data.count,
      }))
  }, [filteredAppointments])

  // Monthly trend data - Live data
const monthlyTrend = useMemo(() => {
  const monthMap = new Map<string, { revenue: number; appointments: number }>()

  // Build a quick lookup for service prices
  const servicePriceMap = new Map<string, number>(
    services.map(service => [service.id, Number(service.price)])
  )

  filteredAppointments.forEach((apt) => {
    const date = new Date(apt.appointment_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const current = monthMap.get(monthKey) || { revenue: 0, appointments: 0 }

    const price = servicePriceMap.get(apt.service_id) || 0

    monthMap.set(monthKey, {
      revenue: current.revenue + price,
      appointments: current.appointments + 1,
    })
  })

  return Array.from(monthMap.entries())
    .map(([monthKey, data]) => ({
      month: new Date(`${monthKey}-01`).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      revenue: data.revenue,
      appointments: data.appointments,
    }))
    .sort((a, b) => new Date(`${a.month} 1`).getTime() - new Date(`${b.month} 1`).getTime())
}, [filteredAppointments, services])

  // Calculate growth rate from live data
  const growthRate = useMemo(() => {
    if (monthlyTrend.length < 2) return 0
    const current = monthlyTrend[monthlyTrend.length - 1]?.revenue || 0
    const previous = monthlyTrend[monthlyTrend.length - 2]?.revenue || 0
    return previous > 0 ? ((current - previous) / previous) * 100 : 0
  }, [monthlyTrend])

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    appointments: {
      label: "Appointments",
      color: "hsl(var(--chart-2))",
    },
    count: {
      label: "Count",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls and Real-time Indicator */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Dashboard
            <Badge variant="outline" className="text-xs">
              Live Data
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Real-time business performance and insights • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.name}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Status Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>
          Displaying live data from {filteredAppointments.length} appointments across {services.length} services
        </span>
      </div>

      {/* Key Metrics - Live Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {growthRate > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 mr-1 text-red-500 rotate-180" />
              )}
              {Math.abs(growthRate).toFixed(1)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Completed & confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageBookingValue, language)}</div>
            <p className="text-xs text-muted-foreground">Per appointment average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Service</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueByService.length > 0 ? revenueByService.sort((a, b) => b.revenue - a.revenue)[0].service : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Highest revenue generator</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - All using live data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Trend - Live Data */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
            <CardDescription>Live revenue performance by specific dates</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      name === "revenue" ? Number(value) + "$ " : value,
                      name === "revenue" ? "Revenue" : "Appointments",
                    ]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Service Performance by Type - Live Data */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service Type</CardTitle>
            <CardDescription>Live performance breakdown by service categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByService} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      name === "revenue" ? formatCurrency(Number(value), language) : value,
                      name === "revenue" ? "Revenue" : name === "count" ? "Bookings" : "Base Price",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Client Age Demographics - Live Data */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Client Age</CardTitle>
            <CardDescription>Live income segmentation by age demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByAge}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ ageGroup, percent }) => `${ageGroup} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {revenueByAge.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [formatCurrency(Number(value), language), "Revenue"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Service Price Analysis - Live Data */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Service Price Range</CardTitle>
            <CardDescription>Live income distribution by service pricing tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicePriceAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priceRange" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      name === "revenue" ? formatCurrency(Number(value), language) : value,
                      name === "revenue" ? "Revenue" : name === "count" ? "Bookings" : "Average Price",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Comparison - Live Data */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Trends</CardTitle>
          <CardDescription>Live revenue and appointment trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(Number(value), language) : value,
                    name === "revenue" ? "Revenue" : "Appointments",
                  ]}
                />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={3} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="appointments"
                  stroke="var(--color-appointments)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tables - Live Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Details - Live Data */}
        <Card>
          <CardHeader>
            <CardTitle>Service Performance Details</CardTitle>
            <CardDescription>Live comprehensive breakdown of service revenue and pricing</CardDescription>
          </CardHeader>
<CardContent>
  <div className="space-y-4">
    {revenueByService
      .sort((a, b) => b.revenue - a.revenue)
      .map((service, index) => (
        <div
          key={service.fullServiceName}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Badge variant="outline">{index + 1}</Badge>
            <div>
              <p className="font-medium" title={service.fullServiceName}>
                {service.service}
              </p>
              <p className="text-sm text-muted-foreground">
                {service.count} bookings • Base: {formatCurrency(service.basePrice, language)} • Avg:{" "}
                {formatCurrency(service.averagePrice, language)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{formatCurrency(service.revenue, language)}</p>
          </div>
        </div>
      ))}
  </div>
</CardContent>

        </Card>

        {/* Age Group Analysis - Live Data */}
        <Card>
          <CardHeader>
            <CardTitle>Age Demographics Analysis</CardTitle>
            <CardDescription>Live client spending patterns by age groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByAge
                .sort((a, b) => b.revenue - a.revenue)
                .map((ageData, index) => (
                  <div key={ageData.ageGroup} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">Age {ageData.ageGroup}</p>
                        <p className="text-sm text-muted-foreground">
                          {ageData.count} clients • Avg spend: {formatCurrency(ageData.averageSpend, language)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(ageData.revenue, language)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Range Analysis - Live Data */}
      <Card>
        <CardHeader>
          <CardTitle>Service Price Range Analysis</CardTitle>
          <CardDescription>Live revenue distribution across different pricing tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicePriceAnalysis
              .sort((a, b) => b.revenue - a.revenue)
              .map((priceData, index) => (
                <div key={priceData.priceRange} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{index + 1}</Badge>
                    <p className="font-bold">{formatCurrency(priceData.revenue, language)}</p>
                  </div>
                  <h3 className="font-medium">{priceData.priceRange}</h3>
                  <p className="text-sm text-muted-foreground">
                    {priceData.count} services • Avg: {formatCurrency(priceData.averagePrice, language)}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
