import { requireAdmin } from "@/lib/auth"
import { getAllBarbers, getAllAppointments } from "@/lib/db"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const user = await requireAdmin()
  const barbers = await getAllBarbers()
  const appointments = await getAllAppointments()

  return <AdminDashboard user={user} barbers={barbers} appointments={appointments} />
}
