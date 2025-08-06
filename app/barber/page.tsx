import { requireBarber } from "@/lib/auth"
import { getStoreByBarberId, getServicesByStoreId, getAppointmentsByStoreId, getWorkingHoursByStoreId, checkAndUpdateBarberTrialStatus } from "@/lib/db"
import { BarberDashboard } from "@/components/barber-dashboard"

export default async function BarberPage() {
  const user = await requireBarber()
  const store = await getStoreByBarberId(user.id)
  //const services = store ? await getServicesByStoreId(store.id) : []
  const appointments = store ? await getAppointmentsByStoreId(store.id) : []
  const workingHours = store ? await getWorkingHoursByStoreId(store.id) : []
  const userStatus = await checkAndUpdateBarberTrialStatus(user.id)

  return (
    <BarberDashboard
      storeId={store?.id || ""}
      userStatus={userStatus?.status}
      user={user}
      store={store}
      //ervices={services}
      appointments={appointments}
      workingHours={workingHours}
    />
  )
}
