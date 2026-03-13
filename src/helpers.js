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
    options.push(`${String(h).padStart(2, '0')}:30`)
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

/**
 * Shifts a YYYY-MM-DD date string by a number of days.
 * Example: shiftDate('2026-03-01', -1) → '2026-02-28'
 */
export function shiftDate(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

const DAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS_SHORT_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const MONTHS_LONG_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/**
 * Formats a YYYY-MM-DD string as a short day label.
 * Example: formatDayLabel('2026-03-13') → 'FRI 13. MAR'
 */
export function formatDayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${DAYS_EN[date.getDay()]} ${d}. ${MONTHS_SHORT_EN[m - 1]}`
}

/**
 * Returns the current month as a YYYY-MM string.
 */
export function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Returns the first and last day of a given YYYY-MM month.
 * Example: monthBounds('2026-03') → { start: '2026-03-01', end: '2026-03-31' }
 */
export function monthBounds(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  return {
    start: `${yearMonth}-01`,
    end: `${yearMonth}-${String(lastDay).padStart(2, '0')}`
  }
}

/**
 * Formats a YYYY-MM string as a human-readable month label.
 * Example: formatMonthLabel('2026-03') → 'March 2026'
 */
export function formatMonthLabel(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  return `${MONTHS_LONG_EN[m - 1]} ${y}`
}

/**
 * Shifts a YYYY-MM string by a number of months.
 * Example: shiftMonth('2026-03', -1) → '2026-02'
 */
export function shiftMonth(yearMonth, delta) {
  const [y, m] = yearMonth.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
