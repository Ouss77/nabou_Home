import { neon } from "@neondatabase/serverless"

// Create Neon SQL client
const sql = neon(process.env.DATABASE_URL!)

// Type definitions
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "barber"
  created_at: string
}

export interface Store {
  id: string
  barber_id: string
  title: string
  address: string
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  store_id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number
  created_at: string
}

export interface Appointment {
  id: string
  store_id: string
  service_id: string
  client_name: string
  client_email: string
  client_phone: string | null
  appointment_date: string
  appointment_time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes: string | null
  created_at: string
  service_name?: string
  service_price?: number
  store_title?: string
  barber_name?: string
}

// Custom error for booking conflicts
export class BookingConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "BookingConflictError"
  }
}

// Custom error for past appointment attempts
export class PastAppointmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PastAppointmentError"
  }
}

// User functions
export async function createUser(email: string, passwordHash: string, name: string, role: "admin" | "barber") {
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${email}, ${passwordHash}, ${name}, ${role})
    RETURNING id, email, name, role, created_at
  `
  return result[0]
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, name, role, created_at
    FROM users
    WHERE email = ${email}
  `
  return result[0] || null
}

export async function getAllStores() {
  const result = await sql` SELECT * FROM stores`
  return result
}

export async function getAllBarbers() {
  const result = await sql`
    SELECT u.id, u.email, u.name, u.created_at,
           COUNT(a.id) as appointment_count
    FROM users u
    LEFT JOIN stores s ON u.id = s.barber_id
    LEFT JOIN appointments a ON s.id = a.store_id
    WHERE u.role = 'barber'
    GROUP BY u.id, u.email, u.name, u.created_at
    ORDER BY u.created_at DESC
  `
  return result
}

// Store functions
export async function getStoreByBarberId(barberId: string) {
  const result = await sql`
    SELECT * FROM stores WHERE barber_id = ${barberId}
  `
  return result[0] || null
}

export async function getStoreById(storeId: string) {
  const result = await sql`
    SELECT * FROM stores WHERE id = ${storeId}
  `
  return result[0] || null
}

export async function createStore(
  barberId: string,
  title: string,
  address: string,
  description: string,
  imageUrl?: string,
) {
  const result = await sql`
    INSERT INTO stores (barber_id, title, address, description, image_url)
    VALUES (${barberId}, ${title}, ${address}, ${description}, ${imageUrl || null})
    RETURNING *
  `
  return result[0]
}

export async function updateStore(
  storeId: string,
  title: string,
  address: string,
  description: string,
  imageUrl?: string,
) {
  const result = await sql`
    UPDATE stores 
    SET title = ${title}, address = ${address}, description = ${description}, 
        image_url = ${imageUrl || null}, updated_at = NOW()
    WHERE id = ${storeId}
    RETURNING *
  `
  return result[0]
}

// Service functions
export async function getServicesByStoreId(storeId: string) {
  const result = await sql`
    SELECT * FROM services WHERE store_id = ${storeId} ORDER BY created_at
  `
  return result
}

export async function createService(
  storeId: string,
  name: string,
  description: string,
  price: number,
  durationMinutes: number,
) {
  const result = await sql`
    INSERT INTO services (store_id, name, description, price, duration_minutes)
    VALUES (${storeId}, ${name}, ${description}, ${price}, ${durationMinutes})
    RETURNING *
  `
  return result[0]
}

export async function updateService(
  serviceId: string,
  name: string,
  description: string,
  price: number,
  durationMinutes: number,
) {
  const result = await sql`
    UPDATE services 
    SET name = ${name}, description = ${description}, price = ${price}, duration_minutes = ${durationMinutes}
    WHERE id = ${serviceId}
    RETURNING *
  `
  return result[0]
}

export async function deleteService(serviceId: string) {
  await sql`DELETE FROM services WHERE id = ${serviceId}`
}

// Appointment functions
export async function getAppointmentsByStoreId(storeId: string) {
  const result = await sql`
    SELECT a.*, s.name as service_name, s.price as service_price
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.store_id = ${storeId}
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `
  return result
}

// Check if a time slot is available
export async function checkTimeSlotAvailability(
  storeId: string,
  appointmentDate: string,
  appointmentTime: string,
): Promise<boolean> {
  const result = await sql`
    SELECT id FROM appointments 
    WHERE store_id = ${storeId} 
    AND appointment_date = ${appointmentDate} 
    AND appointment_time = ${appointmentTime}
    AND status IN ('pending', 'confirmed')
  `
  return result.length === 0
}

// Get service duration for overlap checking
export async function getServiceDuration(serviceId: string): Promise<number> {
  const result = await sql`
    SELECT duration_minutes FROM services WHERE id = ${serviceId}
  `
  return result[0]?.duration_minutes || 30
}

// Check for overlapping appointments considering service duration
export async function checkForOverlappingAppointments(
  storeId: string,
  serviceId: string,
  appointmentDate: string,
  appointmentTime: string,
): Promise<boolean> {
  const serviceDuration = await getServiceDuration(serviceId)

  // Convert appointment time to minutes for calculation
  const [hours, minutes] = appointmentTime.split(":").map(Number)
  const appointmentMinutes = hours * 60 + minutes
  const endMinutes = appointmentMinutes + serviceDuration

  // Check for any existing appointments that would overlap
  const result = await sql`
    SELECT a.id, a.appointment_time, s.duration_minutes
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.store_id = ${storeId}
    AND a.appointment_date = ${appointmentDate}
    AND a.status IN ('pending', 'confirmed')
  `

  // Check each existing appointment for overlap
  for (const existing of result) {
    const [existingHours, existingMinutes] = existing.appointment_time.split(":").map(Number)
    const existingStart = existingHours * 60 + existingMinutes
    const existingEnd = existingStart + existing.duration_minutes

    // Check if appointments overlap
    if (
      (appointmentMinutes < existingEnd && endMinutes > existingStart) ||
      (existingStart < endMinutes && existingEnd > appointmentMinutes)
    ) {
      return false // Overlap found
    }
  }

  return true // No overlap
}

export async function createAppointment(
  storeId: string,
  serviceId: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  appointmentDate: string,
  appointmentTime: string,
  notes?: string,
) {
  // Start a transaction to ensure atomicity
  try {
    // Basic server-side validation - only reject obviously past dates
    const appointmentDateObj = new Date(appointmentDate)
    const serverNow = new Date()

    // Only reject if the date is clearly in the past (more than 1 day ago)
    const oneDayAgo = new Date(serverNow)
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    if (appointmentDateObj < oneDayAgo) {
      throw new PastAppointmentError("Cannot book appointments for past dates. Please select a future date.")
    }

    // First, check if the exact time slot is available
    const isTimeSlotAvailable = await checkTimeSlotAvailability(storeId, appointmentDate, appointmentTime)

    if (!isTimeSlotAvailable) {
      throw new BookingConflictError("This time slot is already booked. Please select a different time.")
    }

    // Check for overlapping appointments considering service duration
    const noOverlap = await checkForOverlappingAppointments(storeId, serviceId, appointmentDate, appointmentTime)

    if (!noOverlap) {
      throw new BookingConflictError(
        "This appointment would overlap with an existing booking. Please select a different time.",
      )
    }

    // Attempt to create the appointment
    const result = await sql`
      INSERT INTO appointments (store_id, service_id, client_name, client_email, client_phone, appointment_date, appointment_time, notes)
      VALUES (${storeId}, ${serviceId}, ${clientName}, ${clientEmail}, ${clientPhone}, ${appointmentDate}, ${appointmentTime}, ${notes || null})
      RETURNING *
    `

    return result[0]
  } catch (error) {
    // Handle database constraint violations
    if (error instanceof Error && error.message.includes("unique_store_date_time")) {
      throw new BookingConflictError(
        "This time slot was just booked by another client. Please select a different time.",
      )
    }

    // Re-throw custom errors as-is
    if (error instanceof BookingConflictError || error instanceof PastAppointmentError) {
      throw error
    }

    // Handle other errors
    console.error("Error creating appointment:", error)
    throw new Error("Failed to create appointment. Please try again.")
  }
}

export async function getAllAppointments() {
  const result = await sql`
    SELECT a.*, s.name as service_name, s.price as service_price, st.title as store_title, u.name as barber_name
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN stores st ON a.store_id = st.id
    JOIN users u ON st.barber_id = u.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `
  return result
}

export async function getAppointmentsByStoreIdAndDate(storeId: string, date: string) {
  const result = await sql`
    SELECT a.appointment_time, s.duration_minutes
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.store_id = ${storeId} 
    AND a.appointment_date = ${date} 
    AND a.status IN ('pending', 'confirmed')
    ORDER BY a.appointment_time
  `
  return result
}

// Get all booked time slots for a specific date (including overlapping times)
export async function getBookedTimeSlots(storeId: string, date: string): Promise<string[]> {
  const appointments = await getAppointmentsByStoreIdAndDate(storeId, date)
  const bookedSlots = new Set<string>()

  // Standard time slots (every 30 minutes from 9:00 to 17:30)
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ]

  for (const appointment of appointments) {
    const [hours, minutes] = appointment.appointment_time.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + appointment.duration_minutes

    // Mark all time slots that overlap with this appointment as booked
    for (const slot of timeSlots) {
      const [slotHours, slotMinutes] = slot.split(":").map(Number)
      const slotStart = slotHours * 60 + slotMinutes
      const slotEnd = slotStart + 30 // Each slot is 30 minutes

      // Check if this slot overlaps with the appointment
      if (slotStart < endMinutes && slotEnd > startMinutes) {
        bookedSlots.add(slot)
      }
    }
  }

  return Array.from(bookedSlots)
}
