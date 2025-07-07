import { getStoreBySlug, getServicesByStoreId } from "@/lib/db";
import { BookingPage } from "@/components/booking-page";
import { notFound } from "next/navigation";

export default async function PublicBookingPage({ params }: { params: { slug: string } }) {
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    notFound();
  }

  const services = await getServicesByStoreId(store.id);


  return <BookingPage store={store} services={services} />;
}
 