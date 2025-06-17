import { requireBarber } from "@/lib/auth"
import { getStoreByBarberId, getServicesByStoreId, getAppointmentsByStoreId, getWorkingHoursByStoreId } from "@/lib/db"
import { BarberDashboard } from "@/components/barber-dashboard"

export default async function BarberPage() {
  const user = await requireBarber()
  const store = await getStoreByBarberId(user.id)
  const services = store ? await getServicesByStoreId(store.id) : []
  const appointments = store ? await getAppointmentsByStoreId(store.id) : []
  const workingHours = store ? await getWorkingHoursByStoreId(store.id) : []

  return (
    <BarberDashboard
      user={user}
      store={store}
      services={services}
      appointments={appointments}
      workingHours={workingHours}
    />
  )
}
