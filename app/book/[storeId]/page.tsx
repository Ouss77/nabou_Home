import { getStoreById, getServicesByStoreId } from "@/lib/db"
import { BookingPage } from "@/components/booking-page"
import { notFound } from "next/navigation"

export default async function PublicBookingPage({ params }: { params: { storeId: string } }) {
  const store = await getStoreById(params.storeId)

  if (!store) {
    notFound()
  }

  const services = await getServicesByStoreId(store.id)

  return <BookingPage store={store} services={services} />
}
