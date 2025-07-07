import { requireAdmin } from "@/lib/auth"
import { getAllBarbers, getAllAppointments } from "@/lib/db"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { useEffect, useState } from "react"

export default async function AdminPage() {
  const user = await requireAdmin()
  const barbers = await getAllBarbers()
  const appointments = await getAllAppointments()

  // TODO: Replace with actual logic to get the current storeId
  const storeId = "your-store-id"
  const [data, setData] = useState({ appointments: [], services: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/${storeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics data")
        return res.json()
      })
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [storeId])

  if (loading) return <div>Loading analytics...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <>
      <AdminDashboard user={user} barbers={barbers} appointments={appointments} />
      <AnalyticsDashboard
        appointments={data.appointments}
        services={data.services}
        storeId={storeId}
      />
    </>
  )
}
