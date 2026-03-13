// helpers.js — shared utility functions
// Time calculations and small helpers used across components

/**
 * Calculates the number of hours between two HH:MM time strings.
 * Example: calcHours('09:00', '12:30') returns 3.5
 */
export function calcHours(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  const startTotal = startH * 60 + startM
  const endTotal = endH * 60 + endM
  return (endTotal - startTotal) / 60
}

/**
 * Generates a list of time options in 30-minute steps from 07:00 to 23:00.
 * Returns an array of strings like ['07:00', '07:30', '08:00', ...]
 */
export function getTimeOptions() {
  const options = []
  for (let h = 7; h <= 23; h++) {
    options.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 23) options.push(`${String(h).padStart(2, '0')}:30`)
  }
  return options
}

/**
 * Formats a decimal hour value into a readable string.
 * Example: formatHours(3.5) returns '3.5h'
 */
export function formatHours(decimal) {
  return `${decimal}h`
}

/**
 * Returns today's date as a YYYY-MM-DD string.
 */
export function todayString() {
  return new Date().toISOString().split('T')[0]
}
