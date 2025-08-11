import { notFound } from "next/navigation"
import { getStoreBySlug, getServicesByStoreId, getWorkingHoursByStoreId, getStoreImages } from "@/lib/db"
import { BarberLandingPage } from "@/components/barber-landing-page"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

interface PageProps {
  params: {
    slug: string
  }
}

async function getLandingPageData(storeId: string) {
  try {
    const result = await sql`
      SELECT * FROM landing_page_data WHERE store_id = ${storeId}
    `

    if (result[0]) {
      return {
        bio: result[0].bio,
        specialties: result[0].specialties || [],
        experience_years: result[0].experience_years,
        social_links: result[0].social_links || {},
        external_booking_links: result[0].external_booking_links || [],
        testimonials: result[0].testimonials || [],
      }
    }

    return {}
  } catch (error) {
    console.error("Error fetching landing page data:", error)
    return {}
  }
}

export default async function BarberProfilePage({ params }: PageProps) {
  const store = await getStoreBySlug(params.slug)

  if (!store) {
    notFound()
  }

  const [services, workingHours, images, landingPageData] = await Promise.all([
    getServicesByStoreId(store.id),
    getWorkingHoursByStoreId(store.id),
    getStoreImages(store.id),
    getLandingPageData(store.id),
  ])

  return (
    <BarberLandingPage
      store={store}
      services={services}
      workingHours={workingHours}
      images={images}
      landingPageData={landingPageData}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const store = await getStoreBySlug(params.slug)

  if (!store) {
    return {
      title: "Barber Not Found",
    }
  }

  return {
    title: `${store.barber_name} - ${store.title}`,
    description: store.description || `Professional Barber Categories by ${store.barber_name}`,
  }
}
