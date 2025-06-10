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
 * Convert a Date object to YYYY-MM-DD format in local timezone
 * This is crucial to avoid timezone conversion issues
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
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
 * Convert a date string (YYYY-MM-DD) to a Date object at local midnight
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number)
  // Creates a date at midnight in the local timezone
  return new Date(year, month - 1, day)
}

/**
 * Check if a given date and time is in the past (client-side)
 */
export function isDateTimePast(date: string, time: string): boolean {
  const appointmentDateTime = parseLocalDate(date)
  const [hours, minutes] = time.split(":").map(Number)
  appointmentDateTime.setHours(hours, minutes, 0, 0)

  const now = getCurrentDateTime()
  return appointmentDateTime < now
}

/**
 * Check if a time slot is in the past for a given date (client-side)
 */
export function isTimeSlotPast(time: string, dateString: string): boolean {
  const todayString = getCurrentDateString()

  // Compare date strings directly first for clarity
  if (compareDateStrings(dateString, todayString) > 0) {
    // dateString is in the future
    return false
  }
  if (compareDateStrings(dateString, todayString) < 0) {
    // dateString is in the past
    return true
  }

  // If dateString is today, compare the time
  const now = getCurrentDateTime()
  const [hours, minutes] = time.split(":").map(Number)
  const timeSlotToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)

  return timeSlotToday < now
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
export function minutesToTime(minutesValue: number): string {
  const hours = Math.floor(minutesValue / 60)
  const mins = minutesValue % 60
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

/**
 * Get all time slots that have passed for a given date (client-side)
 */
export function getPassedTimeSlots(dateString: string, timeSlots: string[]): string[] {
  const todayString = getCurrentDateString()

  if (compareDateStrings(dateString, todayString) > 0) {
    // Future date
    return []
  }
  if (compareDateStrings(dateString, todayString) < 0) {
    // Past date
    return [...timeSlots]
  }
  // Today: filter based on current time
  return timeSlots.filter((time) => isTimeSlotPast(time, dateString))
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
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Check if a date is today (client-side)
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, getCurrentDateTime())
}

/**
 * Check if a date is in the past (client-side)
 * Compares based on the start of the day.
 */
export function isDateInPast(date: Date): boolean {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const checkDateStart = new Date(date)
  checkDateStart.setHours(0, 0, 0, 0)

  return checkDateStart < todayStart
}

/**
 * Get timezone name
 */
export function getTimezoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Get tomorrow's date string for comparison
 */
export function getTomorrowDateString(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDateToString(tomorrow)
}

/**
 * Check if a given date string is tomorrow
 */
export function isTomorrow(dateString: string): boolean {
  return dateString === getTomorrowDateString()
}

/**
 * Compare two date strings (YYYY-MM-DD).
 * Returns:
 * -1 if date1 is before date2
 *  0 if date1 is the same as date2
 *  1 if date1 is after date2
 */
export function compareDateStrings(date1String: string, date2String: string): number {
  // Direct string comparison works for YYYY-MM-DD format
  if (date1String < date2String) return -1
  if (date1String > date2String) return 1
  return 0
}

/**
 * Debug function to help troubleshoot date issues
 */
export function debugDateInfo(selectedDate: Date | null): void {
  if (!selectedDate) {
    console.log("[DEBUG] No selected date")
    return
  }

  const now = new Date()
  const todayString = getCurrentDateString()
  const selectedDateString = formatDateToString(selectedDate)
  const tomorrowString = getTomorrowDateString()

  console.log("[DEBUG] Date Information:", {
    now: now.toString(),
    todayString,
    selectedDateString,
    tomorrowString,
    isToday: isToday(selectedDate),
    isTomorrow: isTomorrow(selectedDateString),
    comparison: compareDateStrings(selectedDateString, todayString),
    timezone: getTimezoneName(),
  })
}
