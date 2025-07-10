import { notFound } from "next/navigation"
import { BookingPage } from "@/components/booking-page"
import { getStoreBySlug } from "@/lib/db"

interface BookingPageProps {
  params: {
    slug: string
  }
}

export default async function BookingPageRoute({ params }: BookingPageProps) {
  const store = await getStoreBySlug(params.slug)

  if (!store) {
    notFound()
  }

  return <BookingPage storeSlug={params.slug} />
}

export async function generateMetadata({ params }: BookingPageProps) {
  const store = await getStoreBySlug(params.slug)

  if (!store) {
    return {
      title: "Store Not Found",
    }
  }

  return {
    title: `Book Appointment - ${store.title}`,
    description: `Book your appointment at ${store.title}. ${store.description || "Professional barber services available."}`,
  }
}
