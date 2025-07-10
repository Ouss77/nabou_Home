import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "barber"
  status?: "trial" | "active" | "expired"
  created_at: string
}

export interface Barber extends User {
  appointment_count: number
}

export interface Appointment {
  id: string
  client_name: string
  client_email: string
  appointment_date: string
  appointment_time: string
  status: string
  service_name: string
  service_price: number
  store_title: string
  barber_name: string
  barber_id: string
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string,
  role: "admin" | "barber" = "barber",
): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role, status)
    VALUES (${email}, ${passwordHash}, ${name}, ${role}, ${role === "barber" ? "trial" : null})
    RETURNING id, email, name, role, status, created_at
  `
  return result[0] as User
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, role, status, created_at, password_hash
    FROM users
    WHERE email = ${email}
  `
  return result[0] as User | null
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, role, status, created_at
    FROM users
    WHERE id = ${id}
  `
  return result[0] as User | null
}

export async function getAllBarbers(): Promise<Barber[]> {
  const result = await sql`
    SELECT 
      u.id,
      u.email,
      u.name,
      u.role,
      u.status,
      u.created_at,
      COALESCE(appointment_counts.count, 0) as appointment_count
    FROM users u
    LEFT JOIN (
      SELECT 
        s.user_id,
        COUNT(a.id) as count
      FROM stores s
      LEFT JOIN appointments a ON s.id = a.store_id
      GROUP BY s.user_id
    ) appointment_counts ON u.id = appointment_counts.user_id
    WHERE u.role = 'barber'
    ORDER BY u.created_at DESC
  `
  return result as Barber[]
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const result = await sql`
    SELECT 
      a.id,
      a.client_name,
      a.client_email,
      a.appointment_date,
      a.appointment_time,
      a.status,
      s.title as store_title,
      u.name as barber_name,
      u.id as barber_id,
      srv.name as service_name,
      srv.price as service_price
    FROM appointments a
    JOIN stores s ON a.store_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN services srv ON a.service_id = srv.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `
  return result as Appointment[]
}

export async function getBarberAppointmentCount(barberId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(a.id) as count
    FROM appointments a
    JOIN stores s ON a.store_id = s.id
    WHERE s.user_id = ${barberId}
  `
  return Number.parseInt(result[0]?.count || "0")
}

export async function updateBarberStatus(barberId: string, status: "trial" | "active" | "expired"): Promise<void> {
  await sql`
    UPDATE users
    SET status = ${status}
    WHERE id = ${barberId} AND role = 'barber'
  `
}

export async function checkAndUpdateBarberTrialStatus(barberId: string): Promise<"trial" | "active" | "expired"> {
  // Get current barber info
  const barber = await getUserById(barberId)
  if (!barber || barber.role !== "barber") {
    throw new Error("Barber not found")
  }

  // If already active, no need to check
  if (barber.status === "active") {
    return "active"
  }

  // If trial, check appointment count
  if (barber.status === "trial") {
    const appointmentCount = await getBarberAppointmentCount(barberId)

    if (appointmentCount > 20) {
      // Update to expired
      await updateBarberStatus(barberId, "expired")
      return "expired"
    }

    return "trial"
  }

  // If expired, stay expired
  return "expired"
}

// Store-related functions
export async function createStore(
  userId: string,
  title: string,
  description: string,
  address: string,
  phone: string,
  slug: string,
) {
  const result = await sql`
    INSERT INTO stores (user_id, title, description, address, phone, slug)
    VALUES (${userId}, ${title}, ${description}, ${address}, ${phone}, ${slug})
    RETURNING *
  `
  return result[0]
}

export async function getStoreBySlug(slug: string) {
  const result = await sql`
    SELECT s.*, u.name as barber_name
    FROM stores s
    JOIN users u ON s.user_id = u.id
    WHERE s.slug = ${slug}
  `
  return result[0]
}

export async function getStoresByUserId(userId: string) {
  const result = await sql`
    SELECT * FROM stores WHERE user_id = ${userId}
  `
  return result
}

// Service-related functions
export async function getServicesByStoreId(storeId: string) {
  const result = await sql`
    SELECT * FROM services WHERE store_id = ${storeId} ORDER BY name
  `
  return result
}

export async function createService(
  storeId: string,
  name: string,
  description: string,
  price: number,
  duration: number,
) {
  const result = await sql`
    INSERT INTO services (store_id, name, description, price, duration)
    VALUES (${storeId}, ${name}, ${description}, ${price}, ${duration})
    RETURNING *
  `
  return result[0]
}

// Appointment-related functions
export async function createAppointment(
  storeId: string,
  serviceId: string,
  clientName: string,
  clientEmail: string,
  appointmentDate: string,
  appointmentTime: string,
) {
  const result = await sql`
    INSERT INTO appointments (store_id, service_id, client_name, client_email, appointment_date, appointment_time, status)
    VALUES (${storeId}, ${serviceId}, ${clientName}, ${clientEmail}, ${appointmentDate}, ${appointmentTime}, 'pending')
    RETURNING *
  `
  return result[0]
}

export async function getAppointmentsByStoreId(storeId: string) {
  const result = await sql`
    SELECT 
      a.*,
      s.name as service_name,
      s.price as service_price,
      s.duration as service_duration
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.store_id = ${storeId}
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `
  return result
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const result = await sql`
    UPDATE appointments
    SET status = ${status}
    WHERE id = ${appointmentId}
    RETURNING *
  `
  return result[0]
}
