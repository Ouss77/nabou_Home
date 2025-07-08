import { neon } from "@neondatabase/serverless"
import slugify from "slugify"

// Create Neon SQL client
const sql = neon(process.env.DATABASE_URL!)

// Type definitions
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "barber"
  status?: "trial" | "active" | "expired"
  created_at: string
  phone?: string
  city?: string
  profile_completed?: boolean
  email_verified?: boolean
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

export interface StoreImage {
  id: string
  store_id: string
  image_data: string // Base64 encoded
  image_name: string
  image_type: string
  image_size: number
  is_primary: boolean
  created_at: string
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

export interface WorkingHours {
  id: string
  store_id: string
  day_of_week: number // 0 = Sunday, 6 = Saturday
  start_time: string
  end_time: string
  is_closed: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  store_id: string
  service_id: string
  client_name: string
  client_email: string
  client_phone: string | null
  age: number | null // Added age field
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

export interface BlockedTime {
  id: string
  store_id: string
  blocked_date: string
  start_time: string
  end_time: string
  reason: string | null
  created_at: string
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

// Custom error for outside working hours
export class OutsideWorkingHoursError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "OutsideWorkingHoursError"
  }
}

// User functions
export async function createUser(
  email: string,
  passwordHash: string, // This will temporarily be plain text
  name: string,
  role: "admin" | "barber",
  phone?: string,
  city?: string,
) {
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role, phone, city, profile_completed, email_verified, status)
    VALUES (${email}, ${passwordHash}, ${name}, ${role}, ${phone || null}, ${city || null}, ${phone ? true : false}, true, ${role === "barber" ? "trial" : null})
    RETURNING id, email, name, role, phone, city, profile_completed, email_verified, status, created_at
  `
  return result[0]
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, name, role, status, created_at
    FROM users
    WHERE email = ${email}
  `
  return result[0] || null
}

export async function updateBarberStatus(barberId: string, status: "trial" | "active" | "expired") {
  const result = await sql`
    UPDATE users 
    SET status = ${status}
    WHERE id = ${barberId} AND role = 'barber'
    RETURNING id, email, name, role, status, created_at
  `
  return result[0] || null
}

// Get appointment count for a specific barber
export async function getBarberAppointmentCount(barberId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(a.id) as appointment_count
    FROM appointments a
    JOIN stores s ON a.store_id = s.id
    WHERE s.barber_id = ${barberId}
  `
  return Number(result[0]?.appointment_count || 0)
}

// Check and update barber status based on appointment count
export async function checkAndUpdateBarberTrialStatus(barberId: string): Promise<User | null> {
  const user = await sql`
    SELECT id, email, name, role, status, created_at
    FROM users
    WHERE id = ${barberId} AND role = 'barber'
  `

  if (!user[0]) return null

  const currentUser = user[0]

  // Only check trial users
  if (currentUser.status === "trial") {
    const appointmentCount = await getBarberAppointmentCount(barberId)

    // If they have more than 20 appointments, expire their trial
    if (appointmentCount > 20) {
      const updatedUser = await updateBarberStatus(barberId, "expired")
      return updatedUser
    }
  }

  return currentUser
}

export async function getAllStores() {
  const result = await sql` SELECT * FROM stores`
  return result
}

export async function getAllBarbers() {
  const result = await sql`
    SELECT u.id, u.email, u.name, u.status, u.created_at,
           COUNT(a.id) as appointment_count
    FROM users u
    LEFT JOIN stores s ON u.id = s.barber_id
    LEFT JOIN appointments a ON s.id = a.store_id
    WHERE u.role = 'barber'
    GROUP BY u.id, u.email, u.name, u.status, u.created_at
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
export async function getStoreBySlug(slug: string) {
  const result = await sql`
    SELECT * FROM stores WHERE slug = ${slug}
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
  const slug = slugify(title, {
    lower: true,
    strict: true, // removes special chars
    trim: true,
  })

  const result = await sql`
    INSERT INTO stores (barber_id, title, slug, address, description, image_url)
    VALUES (${barberId}, ${title}, ${slug}, ${address}, ${description}, ${imageUrl || null})
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

// Store Images functions
export async function getStoreImages(storeId: string): Promise<StoreImage[]> {
  const result = await sql<StoreImage[]>`
    SELECT id, store_id, image_data, image_name, image_type, image_size, is_primary, created_at
    FROM store_images 
    WHERE store_id = ${storeId} 
    ORDER BY is_primary DESC, created_at ASC
  `
  return result
}

export async function getPrimaryStoreImage(storeId: string): Promise<StoreImage | null> {
  const result = await sql<StoreImage[]>`
    SELECT id, store_id, image_data, image_name, image_type, image_size, is_primary, created_at
    FROM store_images 
    WHERE store_id = ${storeId} AND is_primary = TRUE
    LIMIT 1
  `
  return result[0] || null
}

export async function addStoreImage(
  storeId: string,
  imageData: string,
  imageName: string,
  imageType: string,
  imageSize: number,
  isPrimary = false,
): Promise<StoreImage> {
  // If setting as primary, first remove primary flag from other images
  if (isPrimary) {
    await sql`
      UPDATE store_images 
      SET is_primary = FALSE 
      WHERE store_id = ${storeId}
    `
  }

  const result = await sql<StoreImage[]>`
    INSERT INTO store_images (store_id, image_data, image_name, image_type, image_size, is_primary)
    VALUES (${storeId}, ${imageData}, ${imageName}, ${imageType}, ${imageSize}, ${isPrimary})
    RETURNING id, store_id, image_data, image_name, image_type, image_size, is_primary, created_at
  `
  return result[0]
}

export async function deleteStoreImage(imageId: string): Promise<void> {
  await sql`DELETE FROM store_images WHERE id = ${imageId}`
}

export async function setPrimaryStoreImage(storeId: string, imageId: string): Promise<void> {
  // First remove primary flag from all images for this store
  await sql`
    UPDATE store_images 
    SET is_primary = FALSE 
    WHERE store_id = ${storeId}
  `

  // Then set the specified image as primary
  await sql`
    UPDATE store_images 
    SET is_primary = TRUE 
    WHERE id = ${imageId} AND store_id = ${storeId}
  `
}

// Working Hours functions
export async function getWorkingHoursByStoreId(storeId: string): Promise<WorkingHours[]> {
  const result = await sql<WorkingHours[]>`
    SELECT id, store_id, day_of_week, 
           TO_CHAR(start_time, 'HH24:MI') as start_time, 
           TO_CHAR(end_time, 'HH24:MI') as end_time, 
           is_closed, created_at, updated_at
    FROM working_hours 
    WHERE store_id = ${storeId} 
    ORDER BY day_of_week
  `
  return result
}

export async function upsertWorkingHours(
  storeId: string,
  workingHours: Array<{
    day_of_week: number
    start_time: string
    end_time: string
    is_closed: boolean
  }>,
) {
  try {
    // Delete existing working hours for this store
    await sql`DELETE FROM working_hours WHERE store_id = ${storeId}`

    // Insert new working hours one by one to ensure proper formatting and prevent SQL injection
    for (const wh of workingHours) {
      // Ensure times are in HH:MM format before insertion
      const startTimeFormatted = wh.start_time.substring(0, 5)
      const endTimeFormatted = wh.end_time.substring(0, 5)

      await sql`
        INSERT INTO working_hours (store_id, day_of_week, start_time, end_time, is_closed)
        VALUES (${storeId}, ${wh.day_of_week}, ${startTimeFormatted}, ${endTimeFormatted}, ${wh.is_closed})
      `
    }

    return getWorkingHoursByStoreId(storeId)
  } catch (error) {
    console.error("Error in upsertWorkingHours:", error)
    throw error
  }
}

export async function getWorkingHoursForDate(storeId: string, date: string): Promise<WorkingHours | null> {
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay() // 0 = Sunday, 6 = Saturday

  const result = await sql<WorkingHours[]>`
    SELECT id, store_id, day_of_week, 
           TO_CHAR(start_time, 'HH24:MI') as start_time, 
           TO_CHAR(end_time, 'HH24:MI') as end_time, 
           is_closed, created_at, updated_at
    FROM working_hours 
    WHERE store_id = ${storeId} AND day_of_week = ${dayOfWeek}
  `

  return result[0] || null
}

// Check if a time slot is within working hours
export async function isTimeWithinWorkingHours(
  storeId: string,
  appointmentDate: string,
  appointmentTime: string,
): Promise<boolean> {
  const workingHours = await getWorkingHoursForDate(storeId, appointmentDate)

  // If no working hours are set, use default business hours (9:00 AM to 6:00 PM)
  if (!workingHours) {
    const appointmentMinutes = timeToMinutes(appointmentTime)
    const defaultStartMinutes = 9 * 60 // 9:00 AM
    const defaultEndMinutes = 18 * 60 // 6:00 PM
    return appointmentMinutes >= defaultStartMinutes && appointmentMinutes < defaultEndMinutes
  }

  // If store is closed on this day
  if (workingHours.is_closed) {
    return false
  }

  const appointmentMinutes = timeToMinutes(appointmentTime)
  const startMinutes = timeToMinutes(workingHours.start_time)
  const endMinutes = timeToMinutes(workingHours.end_time)

  return appointmentMinutes >= startMinutes && appointmentMinutes < endMinutes
}

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
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

// Blocked times functions
export async function createBlockedTime(
  storeId: string,
  blockedDate: string,
  startTime: string,
  endTime: string,
  reason?: string,
) {
  const result = await sql`
    INSERT INTO blocked_times (store_id, blocked_date, start_time, end_time, reason)
    VALUES (${storeId}, ${blockedDate}, ${startTime}, ${endTime}, ${reason || null})
    RETURNING *
  `
  return result[0]
}

export async function getBlockedTimesByStoreId(storeId: string) {
  const result = await sql`
    SELECT * FROM blocked_times 
    WHERE store_id = ${storeId} 
    ORDER BY blocked_date DESC, start_time ASC
  `
  return result
}

export async function getBlockedTimesByStoreIdAndDate(storeId: string, date: string) {
  const result = await sql`
    SELECT * FROM blocked_times 
    WHERE store_id = ${storeId} AND blocked_date = ${date}
    ORDER BY start_time ASC
  `
  return result
}

export async function deleteBlockedTime(blockedTimeId: string) {
  await sql`DELETE FROM blocked_times WHERE id = ${blockedTimeId}`
}

// Check if a time slot conflicts with blocked times
export async function checkTimeSlotAgainstBlockedTimes(
  storeId: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceDuration: number,
): Promise<boolean> {
  const blockedTimes = await getBlockedTimesByStoreIdAndDate(storeId, appointmentDate)

  // Convert appointment time to minutes for calculation
  const [hours, minutes] = appointmentTime.split(":").map(Number)
  const appointmentMinutes = hours * 60 + minutes
  const appointmentEndMinutes = appointmentMinutes + serviceDuration

  // Check each blocked time period for overlap
  for (const blocked of blockedTimes) {
    const [blockedStartHours, blockedStartMinutes] = blocked.start_time.split(":").map(Number)
    const [blockedEndHours, blockedEndMinutes] = blocked.end_time.split(":").map(Number)

    const blockedStartMinutesCalc = blockedStartHours * 60 + blockedStartMinutes
    const blockedEndMinutesCalc = blockedEndHours * 60 + blockedEndMinutes

    // Check if appointment overlaps with blocked time
    if (appointmentMinutes < blockedEndMinutesCalc && appointmentEndMinutes > blockedStartMinutesCalc) {
      return false // Conflict found
    }
  }

  return true // No conflict
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
  age?: number,
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

    // Check against blocked times
    const serviceDuration = await getServiceDuration(serviceId)
    const noBlockedTimeConflict = await checkTimeSlotAgainstBlockedTimes(
      storeId,
      appointmentDate,
      appointmentTime,
      serviceDuration,
    )

    if (!noBlockedTimeConflict) {
      throw new BookingConflictError(
        "This time slot is blocked and not available for booking. Please select a different time.",
      )
    }

    // Attempt to create the appointment
    const result = await sql`
      INSERT INTO appointments (store_id, service_id, client_name, client_email, client_phone, appointment_date, appointment_time, notes, age)
      VALUES (${storeId}, ${serviceId}, ${clientName}, ${clientEmail}, ${clientPhone}, ${appointmentDate}, ${appointmentTime}, ${notes || null}, ${age || null})
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

// Get all booked time slots for a specific date (including overlapping times and blocked times)
export async function getBookedTimeSlots(storeId: string, date: string): Promise<string[]> {
  const appointments = await getAppointmentsByStoreIdAndDate(storeId, date)
  const blockedTimes = await getBlockedTimesByStoreIdAndDate(storeId, date)
  const workingHours = await getWorkingHoursForDate(storeId, date)
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
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ]

  // If store is explicitly closed on this day, mark all slots as booked
  if (workingHours && workingHours.is_closed) {
    return [...timeSlots]
  }

  // Use working hours if available, otherwise default to 9:00-18:00
  let workingStartMinutes = 9 * 60 // 9:00 AM
  let workingEndMinutes = 18 * 60 // 6:00 PM

  if (workingHours && !workingHours.is_closed) {
    workingStartMinutes = timeToMinutes(workingHours.start_time)
    workingEndMinutes = timeToMinutes(workingHours.end_time)
  }

  // Mark slots outside working hours as booked
  for (const slot of timeSlots) {
    const slotMinutes = timeToMinutes(slot)
    if (slotMinutes < workingStartMinutes || slotMinutes >= workingEndMinutes) {
      bookedSlots.add(slot)
    }
  }

  // Mark slots blocked by appointments
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

  // Mark slots blocked by blocked times
  for (const blockedTime of blockedTimes) {
    const [startHours, startMinutes] = blockedTime.start_time.split(":").map(Number)
    const [endHours, endMinutes] = blockedTime.end_time.split(":").map(Number)
    const blockedStartMinutes = startHours * 60 + startMinutes
    const blockedEndMinutes = endHours * 60 + endMinutes

    // Mark all time slots that overlap with this blocked time as booked
    for (const slot of timeSlots) {
      const [slotHours, slotMinutes] = slot.split(":").map(Number)
      const slotStart = slotHours * 60 + slotMinutes
      const slotEnd = slotStart + 30 // Each slot is 30 minutes

      // Check if this slot overlaps with the blocked time
      if (slotStart < blockedEndMinutes && slotEnd > blockedStartMinutes) {
        bookedSlots.add(slot)
      }
    }
  }

  return Array.from(bookedSlots)
}
