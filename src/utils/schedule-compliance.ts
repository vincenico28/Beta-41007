/**
 * Schedule Compliance & Deductions Engine
 * Computes exact tardiness (late clock-in) and undertime (early clock-out)
 * against the employee's assigned schedule shift (or 09:00-17:00 standard baseline).
 *
 * DOLE Philippine Labor Standards:
 * - Late clock-in = Hourly Rate / 60 * Tardiness Minutes
 * - Early clock-out = Hourly Rate / 60 * Undertime Minutes
 */

import { format, parseISO } from 'date-fns'

export interface ScheduleComplianceResult {
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  tardinessMinutes: number
  undertimeMinutes: number
  totalLostMinutes: number
  isLate: boolean
  isUndertime: boolean
  tardinessDeduction: number
  undertimeDeduction: number
  totalDeduction: number
  statusLabel: string
}

/**
 * Parses time string (e.g. "09:00:00", "09:00", or ISO timestamp) into minutes from midnight
 */
export function timeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null

  // If ISO string like "2026-08-24T09:15:00+08:00"
  if (timeStr.includes('T')) {
    const d = new Date(timeStr)
    if (isNaN(d.getTime())) return null
    return d.getHours() * 60 + d.getMinutes()
  }

  // If time format "HH:mm" or "HH:mm:ss"
  const parts = timeStr.split(':')
  if (parts.length < 2) return null
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

/**
 * Calculates schedule compliance metrics for a single work shift
 */
export function calculateScheduleCompliance({
  scheduledStart = '09:00',
  scheduledEnd = '17:00',
  clockIn,
  clockOut,
  hourlyRate = 250,
  isOvernight = false,
  gracePeriodMins = 0,
}: {
  scheduledStart?: string
  scheduledEnd?: string
  clockIn?: string | null
  clockOut?: string | null
  hourlyRate?: number
  isOvernight?: boolean
  gracePeriodMins?: number
}): ScheduleComplianceResult {
  const schedStartMins = timeToMinutes(scheduledStart) ?? 540 // 09:00 default
  let schedEndMins = timeToMinutes(scheduledEnd) ?? 1020 // 17:00 default

  if (isOvernight || schedEndMins < schedStartMins) {
    schedEndMins += 24 * 60
  }

  const clockInMins = timeToMinutes(clockIn)
  let clockOutMins = timeToMinutes(clockOut)

  let tardinessMinutes = 0
  if (clockInMins !== null) {
    // If actual clock-in is after scheduled start (+ grace period)
    const effectiveStart = schedStartMins + gracePeriodMins
    if (clockInMins > effectiveStart) {
      tardinessMinutes = Math.max(0, clockInMins - schedStartMins)
    }
  }

  let undertimeMinutes = 0
  if (clockOutMins !== null) {
    if (isOvernight && clockOutMins < schedStartMins) {
      clockOutMins += 24 * 60
    }
    // If actual clock-out is before scheduled end
    if (clockOutMins < schedEndMins) {
      undertimeMinutes = Math.max(0, schedEndMins - clockOutMins)
    }
  }

  const totalLostMinutes = tardinessMinutes + undertimeMinutes
  const ratePerMinute = hourlyRate / 60
  const tardinessDeduction = Math.round(tardinessMinutes * ratePerMinute * 100) / 100
  const undertimeDeduction = Math.round(undertimeMinutes * ratePerMinute * 100) / 100
  const totalDeduction = Math.round((tardinessDeduction + undertimeDeduction) * 100) / 100

  const isLate = tardinessMinutes > 0
  const isUndertime = undertimeMinutes > 0

  let statusLabel = 'On-Time'
  if (isLate && isUndertime) {
    statusLabel = `Late (${tardinessMinutes}m) & Early Out (${undertimeMinutes}m)`
  } else if (isLate) {
    statusLabel = `Late (${tardinessMinutes}m)`
  } else if (isUndertime) {
    statusLabel = `Early Out (${undertimeMinutes}m)`
  }

  const formattedStart = clockInMins !== null
    ? `${String(Math.floor(clockInMins / 60) % 24).padStart(2, '0')}:${String(clockInMins % 60).padStart(2, '0')}`
    : undefined

  const formattedEnd = clockOutMins !== null
    ? `${String(Math.floor(clockOutMins / 60) % 24).padStart(2, '0')}:${String(clockOutMins % 60).padStart(2, '0')}`
    : undefined

  return {
    scheduledStart: scheduledStart.slice(0, 5),
    scheduledEnd: scheduledEnd.slice(0, 5),
    actualStart: formattedStart,
    actualEnd: formattedEnd,
    tardinessMinutes,
    undertimeMinutes,
    totalLostMinutes,
    isLate,
    isUndertime,
    tardinessDeduction,
    undertimeDeduction,
    totalDeduction,
    statusLabel,
  }
}
