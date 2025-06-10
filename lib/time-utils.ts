/**
 * Utility functions for time-related operations in the appointment system
 * All functions now properly handle client-side time zones
 */

/**
 * Get the current date and time in the client's local timezone
 */
export function getCurrentDateTime(): Date {
  return new Date()
}

/**
 * Get the current date in YYYY-MM-DD format in local timezone
 */
export function getCurrentDateString(): string {
  const now = getCurrentDateTime()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Get the current time in HH:MM format in local timezone
 */
export function getCurrentTimeString(): string {
  const now = getCurrentDateTime()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * Convert a date string to a Date object in local timezone
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Check if a given date and time is in the past (client-side)
 */
export function isDateTimePast(date: string, time: string): boolean {
  const appointmentDate = parseLocalDate(date)
  const [hours, minutes] = time.split(":").map(Number)
  appointmentDate.setHours(hours, minutes, 0, 0)

  const now = getCurrentDateTime()
  return appointmentDate < now
}

/**
 * Check if a time slot is in the past for a given date (client-side)
 */
export function isTimeSlotPast(time: string, date?: string): boolean {
  const checkDate = date || getCurrentDateString()
  const today = getCurrentDateString()

  // If the date is in the future, the time slot is not past
  if (checkDate > today) {
    return false
  }

  // If the date is in the past, the time slot is past
  if (checkDate < today) {
    return true
  }

  // If it's today, check the time
  return isDateTimePast(checkDate, time)
}

/**
 * Convert time string to minutes for comparison
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/**
 * Convert minutes to time string
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

/**
 * Get all time slots that have passed for a given date (client-side)
 */
export function getPassedTimeSlots(date: string, timeSlots: string[]): string[] {
  return timeSlots.filter((time) => isTimeSlotPast(time, date))
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString()
}

/**
 * Check if a date is today (client-side)
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, getCurrentDateTime())
}

/**
 * Get the next available time slot after current time
 */
export function getNextAvailableTimeSlot(timeSlots: string[], date?: string): string | null {
  const checkDate = date || getCurrentDateString()
  const availableSlots = timeSlots.filter((time) => !isTimeSlotPast(time, checkDate))
  return availableSlots.length > 0 ? availableSlots[0] : null
}

/**
 * Check if a date is in the past (client-side)
 */
export function isDateInPast(date: Date): boolean {
  const today = getCurrentDateTime()
  today.setHours(0, 0, 0, 0)

  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)

  return checkDate < today
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset()
}

/**
 * Get timezone name
 */
export function getTimezoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format time for display with timezone consideration
 */
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Check if current time is within business hours
 */
export function isWithinBusinessHours(currentTime?: Date): boolean {
  const now = currentTime || getCurrentDateTime()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const currentMinutes = hours * 60 + minutes

  // Business hours: 9:00 AM to 6:00 PM
  const startMinutes = 9 * 60 // 9:00 AM
  const endMinutes = 18 * 60 // 6:00 PM

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}
