import {
  getCurrentDateString,
  getTomorrowDateString,
  isTomorrow,
  isTimeSlotPast,
  getPassedTimeSlots,
  compareDateStrings,
} from "./time-utils"

/**
 * Test suite for date handling edge cases
 */
export function testDateHandling() {
  const today = getCurrentDateString()
  const tomorrow = getTomorrowDateString()

  console.group("Date Handling Tests")

  // Test 1: Tomorrow should never have passed times
  console.log("Test 1 - Tomorrow passed times:")
  const tomorrowPassedTimes = getPassedTimeSlots(tomorrow, ["09:00", "10:00", "15:00", "17:00"])
  console.log(`Tomorrow (${tomorrow}) passed times:`, tomorrowPassedTimes)
  console.assert(tomorrowPassedTimes.length === 0, "Tomorrow should have no passed times")

  // Test 2: Tomorrow detection
  console.log("Test 2 - Tomorrow detection:")
  console.log(`Is ${tomorrow} tomorrow?`, isTomorrow(tomorrow))
  console.log(`Is ${today} tomorrow?`, isTomorrow(today))
  console.assert(isTomorrow(tomorrow) === true, "Tomorrow should be detected correctly")
  console.assert(isTomorrow(today) === false, "Today should not be detected as tomorrow")

  // Test 3: Date comparison
  console.log("Test 3 - Date comparison:")
  console.log(`Compare ${today} vs ${tomorrow}:`, compareDateStrings(today, tomorrow))
  console.log(`Compare ${tomorrow} vs ${today}:`, compareDateStrings(tomorrow, today))
  console.assert(compareDateStrings(today, tomorrow) === -1, "Today should be less than tomorrow")
  console.assert(compareDateStrings(tomorrow, today) === 1, "Tomorrow should be greater than today")

  // Test 4: Time slot checking for tomorrow
  console.log("Test 4 - Time slot checking for tomorrow:")
  const timeSlots = ["09:00", "12:00", "15:00", "18:00"]
  timeSlots.forEach((time) => {
    const isPast = isTimeSlotPast(time, tomorrow)
    console.log(`Is ${time} on ${tomorrow} past?`, isPast)
    console.assert(isPast === false, `${time} on tomorrow should not be past`)
  })

  console.groupEnd()

  return {
    today,
    tomorrow,
    allTestsPassed: true,
  }
}

/**
 * Run tests in development mode
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Run tests when this module is imported in development
  setTimeout(() => {
    testDateHandling()
  }, 1000)
}
