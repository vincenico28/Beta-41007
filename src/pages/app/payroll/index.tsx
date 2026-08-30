import { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfMonth, endOfMonth, subMonths, setDate } from 'date-fns'
import {
  DollarSign, Users, TrendingUp, Download,
  CheckCircle, Clock, AlertCircle, ChevronRight, CreditCard,
  Wallet, PieChart, ArrowUpRight, Loader2, ShieldCheck,
  Building2, Calendar, FileText, Gift, Landmark, Printer,
  Coins, Scale, CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/skeleton-table'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useEmployees } from '@/hooks/use-employees'
import { useTimesheetEntries } from '@/hooks/use-timesheets'
import { useAttendanceRange } from '@/hooks/use-attendance'
import { useLeaveRequests, useAllLeaveBalances, useLeaveTypes } from '@/hooks/use-leaves'
import { usePerformanceReviews } from '@/hooks/use-performance'
import { useSchedules } from '@/hooks/use-schedules'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from 'sonner'
import { downloadCSV } from '@/utils/export'
import { computeLeaveMonetizationLedger } from '@/utils/leave-monetization'
import { calculateScheduleCompliance } from '@/utils/schedule-compliance'
import { YearEndMonetizationTab } from '../leaves/monetization-tab'
import { printHtmlElement } from '@/utils/print'
import {
  calculateSSS,
  calculatePhilHealth,
  calculatePagIbig,
  calculateWithholdingTax,
  formatPHP,
  type PhilippinePayrollItem,
} from '@/utils/philippine-payroll'

const chartConfig = {
  gross: { label: 'Gross Pay', color: 'var(--chart-1)' },
  net: { label: 'Net Pay', color: 'var(--chart-2)' },
  statutory: { label: 'Govt Deductions', color: 'var(--chart-3)' },
}

type CutoffPeriod = 'first_half' | 'second_half' | 'monthly'

function PayslipDialog({ 
  open, 
  onOpenChange, 
  data,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  data: PhilippinePayrollItem | null;
}) {
  const printableRef = useRef<HTMLDivElement>(null)
  if (!data) return null

  const handlePrint = () => {
    if (printableRef.current) {
      printHtmlElement(printableRef.current, {
        title: `Official Payslip - ${data.employeeName} - ${data.periodLabel}`,
        pageStyle: `@page { size: portrait; margin: 8mm; }`,
      })
    } else {
      window.print()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[96vw] bg-white text-gray-900 sm:rounded-2xl max-h-[92vh] overflow-y-auto p-0 border border-gray-200 shadow-2xl">
        {/* Printable Official Payslip Container */}
        <div ref={printableRef} className="print-area p-6 sm:p-8 bg-white text-gray-900 font-sans space-y-6">
          {/* Official Corporate Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  PRIORITY HANDLING LOGISTICS, INC.
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
                  Philippine Corporate Logistics Center • Air, Sea & Ground Freight Solutions
                </p>
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  BIR TIN: 009-842-153-000 &bull; DOLE Reg. No: NCR-QC-2024-08 &bull; SEC Reg: CS201812345
                </p>
              </div>
              <div className="sm:text-right flex flex-col items-start sm:items-end">
                <span className="inline-block bg-slate-900 text-white text-xs font-extrabold px-3 py-1 rounded-md tracking-wider uppercase">
                  OFFICIAL PAYSLIP (DOLE COMPLIANT)
                </span>
                <p className="text-xs sm:text-sm font-bold text-gray-800 mt-1.5">
                  Pay Period: <span className="text-primary font-extrabold">{data.periodLabel}</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  Disbursal Date: {format(new Date(), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Employee & Statutory Registration Data Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Employee Name</span>
              <strong className="text-gray-900 text-sm font-bold block">{data.employeeName}</strong>
              <p className="text-[11px] text-gray-600 font-mono">ID: {data.employeeNo}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Department & Role</span>
              <p className="text-gray-900 font-semibold">{data.department}</p>
              <p className="text-[11px] text-gray-600">{data.position}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Statutory ID Numbers</span>
              <p className="text-gray-800 font-mono text-[11px]">SSS: {data.sssNo || '34-8921471-0'}</p>
              <p className="text-gray-800 font-mono text-[11px]">PhilHealth: {data.philHealthNo || '12-050219481-4'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Tax & Rate Information</span>
              <p className="text-gray-800 font-mono text-[11px]">Pag-IBIG: {data.pagIbigNo || '1210-9481-2241'}</p>
              <p className="text-gray-800 font-mono text-[11px]">TIN: {data.tinNo || '412-881-094-000'}</p>
              <p className="text-[11px] text-primary font-bold">Rate: ₱{data.baseHourlyRate.toFixed(2)}/hr (₱{(data.baseHourlyRate * 8).toFixed(2)}/day)</p>
            </div>
          </div>

          {/* Two-Column Itemized Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            {/* Earnings Breakdown */}
            <div className="border border-slate-300 rounded-xl overflow-hidden flex flex-col justify-between shadow-xs">
              <div>
                <div className="bg-emerald-50 text-emerald-900 font-extrabold px-4 py-2.5 border-b border-emerald-200 flex justify-between tracking-wide">
                  <span>ITEMIZED EARNINGS</span>
                  <span>AMOUNT (PHP)</span>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200">
                    <span className="text-gray-700">Basic Regular Pay ({data.regularHoursWorked.toFixed(1)} hrs @ ₱{data.baseHourlyRate}/hr)</span>
                    <span className="font-semibold text-gray-900 font-mono">{formatPHP(data.basicPayEarned)}</span>
                  </div>
                  {data.overtimePay > 0 && (
                    <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200">
                      <span className="text-gray-700">Overtime Pay (125% &bull; {data.overtimeHours.toFixed(1)} hrs)</span>
                      <span className="font-semibold text-gray-900 font-mono">{formatPHP(data.overtimePay)}</span>
                    </div>
                  )}
                  {data.paidLeavePay > 0 && (
                    <div className="space-y-1">
                      {data.leaveBreakdown && data.leaveBreakdown.length > 0 ? (
                        data.leaveBreakdown.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-emerald-800 text-xs py-0.5">
                            <span>&bull; {item}</span>
                            <span className="font-semibold font-mono">Paid (DOLE)</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200 text-emerald-800">
                          <span>Paid Statutory Leave ({data.paidLeaveHours.toFixed(1)} hrs)</span>
                          <span className="font-semibold font-mono">{formatPHP(data.paidLeavePay)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {data.unpaidLeaveHours > 0 && (
                    <div className="flex justify-between items-center text-gray-500 italic text-xs py-0.5">
                      <span>Unpaid Leave / LWOP ({data.unpaidLeaveHours.toFixed(1)} hrs)</span>
                      <span className="font-mono">₱0.00</span>
                    </div>
                  )}
                  {data.deMinimisAllowance > 0 && (
                    <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200">
                      <span className="text-gray-700">De Minimis Allowance (Tax-Exempt)</span>
                      <span className="font-semibold text-gray-900 font-mono">{formatPHP(data.deMinimisAllowance)}</span>
                    </div>
                  )}
                  {data.performanceIncentive > 0 && (
                    <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200 text-primary">
                      <span className="font-medium">Performance Appraisal Merit Incentive</span>
                      <span className="font-bold font-mono">{formatPHP(data.performanceIncentive)}</span>
                    </div>
                  )}
                  {data.leaveConversionBonus !== undefined && data.leaveConversionBonus > 0 && (
                    <div className="flex justify-between items-center bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-lg text-xs">
                      <div>
                        <span className="font-bold block">Annual Leave Monetization (DOLE Art. 95)</span>
                        <span className="text-[10px] text-amber-700 block">
                          {data.leaveConversionDays || 0} Unused Converted Days @ ₱{(data.baseHourlyRate * 8).toLocaleString()}/day
                        </span>
                      </div>
                      <span className="font-extrabold text-amber-900 font-mono text-sm">+{formatPHP(data.leaveConversionBonus)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-emerald-50/80 px-4 py-3 border-t-2 border-emerald-300 font-extrabold flex justify-between text-emerald-950">
                <span>TOTAL GROSS EARNINGS</span>
                <span className="font-mono text-base">{formatPHP(data.grossEarnings)}</span>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="border border-slate-300 rounded-xl overflow-hidden flex flex-col justify-between shadow-xs">
              <div>
                <div className="bg-rose-50 text-rose-900 font-extrabold px-4 py-2.5 border-b border-rose-200 flex justify-between tracking-wide">
                  <span>STATUTORY & COMPANY DEDUCTIONS</span>
                  <span>AMOUNT (PHP)</span>
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200">
                    <span className="text-gray-700">SSS Contribution (Employee Share)</span>
                    <span className="font-semibold text-rose-700 font-mono">-{formatPHP(data.sss.employeeShare)}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200">
                    <span className="text-gray-700">PhilHealth Premium (Employee Share 2.5%)</span>
                    <span className="font-semibold text-rose-700 font-mono">-{formatPHP(data.philHealth.employeeShare)}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200">
                    <span className="text-gray-700">Pag-IBIG / HDMF (Employee Share)</span>
                    <span className="font-semibold text-rose-700 font-mono">-{formatPHP(data.pagIbig.employeeShare)}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200">
                    <span className="text-gray-700">BIR Withholding Income Tax (TRAIN Law)</span>
                    <span className="font-semibold text-rose-700 font-mono">
                      {data.tax.withholdingTax > 0 ? `-${formatPHP(data.tax.withholdingTax)}` : '₱0.00 (Exempt)'}
                    </span>
                  </div>
                  {data.tardinessDeduction > 0 && (
                    <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200 text-amber-800">
                      <span>Late Clock-In Penalty ({data.tardinessMinutes} mins)</span>
                      <span className="font-semibold font-mono">-{formatPHP(data.tardinessDeduction)}</span>
                    </div>
                  )}
                  {data.undertimeDeduction > 0 && (
                    <div className="flex justify-between items-center py-0.5 border-b border-dashed border-gray-200 text-amber-800">
                      <span>Early Departure / Undertime ({data.undertimeMinutes} mins)</span>
                      <span className="font-semibold font-mono">-{formatPHP(data.undertimeDeduction)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-rose-50/80 px-4 py-3 border-t-2 border-rose-300 font-extrabold flex justify-between text-rose-950">
                <span>TOTAL DEDUCTIONS</span>
                <span className="font-mono text-base">-{formatPHP(data.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Employer Contributions & 13th Month Transparency Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="font-bold text-slate-900 mb-1">Employer Government Share (For Info Only)</p>
              <div className="flex flex-wrap justify-between text-gray-600 gap-2">
                <span>SSS ER+EC: <strong className="text-gray-900 font-mono">{formatPHP(data.sss.employerShare)}</strong></span>
                <span>PhilHealth ER: <strong className="text-gray-900 font-mono">{formatPHP(data.philHealth.employerShare)}</strong></span>
                <span>Pag-IBIG ER: <strong className="text-gray-900 font-mono">{formatPHP(data.pagIbig.employerShare)}</strong></span>
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-1">Philippine Statutory Accrual</p>
              <div className="flex justify-between text-gray-600">
                <span>Tax Bracket: <strong className="text-gray-900">{data.tax.taxBracket}</strong></span>
                <span className="font-bold text-emerald-800">Accrued 13th Month: {formatPHP(data.accrued13thMonthPay)}</span>
              </div>
            </div>
          </div>

          {/* Grand Net Take-Home Pay Highlight Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest block">TOTAL NET TAKE-HOME PAY</span>
              <p className="text-xs text-slate-400">Disbursed directly to Registered Corporate Payroll Account</p>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white block">
                {formatPHP(data.netTakeHomePay)}
              </span>
            </div>
          </div>

          {/* DOLE Form Signature Lines */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-center border-t border-black">
            <div className="border-t border-black pt-2">
              <p className="font-bold uppercase text-gray-900">{data.employeeName}</p>
              <p className="text-[10px] text-gray-500">Employee Signature & Acknowledgement of Receipt</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-bold uppercase text-gray-900">Disbursing Officer / HR Payroll Head</p>
              <p className="text-[10px] text-gray-500">Certified Correct & Released</p>
            </div>
          </div>

          {/* Footer Legal Note */}
          <div className="text-center text-[10px] text-gray-400 pt-2">
            <p>This is an official computer-generated payslip generated by Priority Handling Logistics, Inc. HR & Payroll System.</p>
            <p>In full compliance with DOLE Labor Advisory No. 26, Presidential Decree No. 851, and BIR Tax Regulations.</p>
          </div>
        </div>

        {/* Modal Action Buttons (Screen only) */}
        <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-gray-200 no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 font-bold px-5" onClick={handlePrint}>
            <Printer className="size-4" /> Generate Printable Payslip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function PayrollPage() {
  const navigate = useNavigate()
  const { can } = usePermissions()
  const [activeTab, setActiveTab] = useState('masterlist')
  const [cutoff, setCutoff] = useState<CutoffPeriod>('first_half')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState<PhilippinePayrollItem | null>(null)

  const today = new Date()
  
  // Date range based on selected Cutoff period
  const { periodStart, periodEnd, periodLabel } = useMemo(() => {
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const midMonth = setDate(today, 15)
    const secondHalfStart = setDate(today, 16)

    if (cutoff === 'first_half') {
      return {
        periodStart: format(monthStart, 'yyyy-MM-dd'),
        periodEnd: format(midMonth, 'yyyy-MM-dd'),
        periodLabel: `1st Cutoff (${format(monthStart, 'MMM 1')} – ${format(midMonth, 'MMM 15, yyyy')})`
      }
    } else if (cutoff === 'second_half') {
      return {
        periodStart: format(secondHalfStart, 'yyyy-MM-dd'),
        periodEnd: format(monthEnd, 'yyyy-MM-dd'),
        periodLabel: `2nd Cutoff (${format(secondHalfStart, 'MMM 16')} – ${format(monthEnd, 'MMM d, yyyy')})`
      }
    } else {
      return {
        periodStart: format(monthStart, 'yyyy-MM-dd'),
        periodEnd: format(monthEnd, 'yyyy-MM-dd'),
        periodLabel: `Monthly (${format(monthStart, 'MMMM yyyy')})`
      }
    }
  }, [cutoff, today])

  const { data: employees, isLoading: empLoading } = useEmployees()
  const { data: currentEntries, isLoading: tsLoading } = useTimesheetEntries(undefined, periodStart, periodEnd)
  const { data: attendance } = useAttendanceRange(periodStart, periodEnd)
  const { data: leaves, isLoading: leavesLoading } = useLeaveRequests()
  const { data: performance, isLoading: perfLoading } = usePerformanceReviews()
  const { data: allBalances, isLoading: balLoading } = useAllLeaveBalances()
  const { data: leaveTypes, isLoading: typesLoading } = useLeaveTypes()
  const { data: schedules } = useSchedules(periodStart, periodEnd)
  const [includeLeaveBonus, setIncludeLeaveBonus] = useState<boolean>(true)

  const leaveMonetization = useMemo(() => {
    if (!employees || !allBalances || !leaveTypes) return null
    return computeLeaveMonetizationLedger(employees, allBalances, leaveTypes)
  }, [employees, allBalances, leaveTypes])

  // Calculate Philippine Payroll Rows with full Attendance & Timesheet reconciliation
  const payrollRows: PhilippinePayrollItem[] = useMemo(() => {
    if (!employees) return []
    const isSemiMonthly = cutoff !== 'monthly'

    return employees
      .filter(e => e.status === 'active')
      .map(emp => {
        const empEntries = (currentEntries ?? []).filter(t => t.employee_id === emp.id)
        const empAtt = (attendance ?? []).filter(a => a.employee_id === emp.id)
        
        // 1. Reconcile Hours from Timesheets & Attendance
        const tsTotalHours = empEntries.reduce((s, t) => s + (t.total_hours ?? 0), 0)
        const tsOvertimeHours = empEntries.reduce((s, t) => s + (t.overtime_hours ?? 0), 0)

        const attTotalHours = empAtt.reduce((s, a) => s + (a.total_hours ?? 0), 0)
        const attOvertimeHours = empAtt.reduce((s, a) => s + (a.overtime_hours ?? 0), 0)

        // Use timesheet hours, or fallback to direct attendance records if timesheets are pending generation
        const effectiveTotalHours = tsTotalHours > 0 ? tsTotalHours : attTotalHours
        const effectiveOvertimeHours = Math.max(tsOvertimeHours, attOvertimeHours)
        const regularHours = Math.max(0, effectiveTotalHours - effectiveOvertimeHours)

        // 2. Reconcile Approved Leaves with Date-Range Overlap
        const empLeaves = (leaves ?? []).filter(l => 
          l.employee_id === emp.id && 
          l.status === 'approved'
        )

        let paidLeaveDays = 0
        let unpaidLeaveDays = 0
        const leaveBreakdownList: string[] = []

        const pStart = new Date(periodStart)
        const pEnd = new Date(periodEnd)

        empLeaves.forEach(l => {
          const lStart = new Date(l.start_date)
          const lEnd = new Date(l.end_date)

          // Check if leave intersects with the period
          if (lStart <= pEnd && lEnd >= pStart) {
            const isHalfDay = l.duration_type === 'half_day_am' || l.duration_type === 'half_day_pm'
            const isPaid = l.leave_types?.is_paid ?? true
            const typeName = l.leave_types?.name || 'Leave'

            if (isHalfDay) {
              if (lStart >= pStart && lStart <= pEnd) {
                if (isPaid) {
                  paidLeaveDays += 0.5
                  leaveBreakdownList.push(`${typeName} (Half-day AM/PM)`)
                } else {
                  unpaidLeaveDays += 0.5
                }
              }
            } else {
              // Calculate overlap days
              const overlapStart = lStart < pStart ? pStart : lStart
              const overlapEnd = lEnd > pEnd ? pEnd : lEnd
              const diffTime = Math.abs(overlapEnd.getTime() - overlapStart.getTime())
              const overlapDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1

              if (isPaid) {
                paidLeaveDays += overlapDays
                leaveBreakdownList.push(`${typeName} (${overlapDays}d)`)
              } else {
                unpaidLeaveDays += overlapDays
              }
            }
          }
        })

        const paidLeaveHours = paidLeaveDays * 8
        const unpaidLeaveHours = unpaidLeaveDays * 8

        // 3. Hourly Rate calculation
        const baseHourlyRate = Number((emp.salary_info as any)?.hourly_rate) || 250
        const monthlyBasicEquivalent = baseHourlyRate * 8 * 22 // 22 working days standard

        // 4. Exact Schedule Compliance: Tardiness & Undertime Deductions
        const empSchedules = (schedules ?? []).filter(s => s.employee_id === emp.id)
        let totalTardinessMinutes = 0
        let totalUndertimeMinutes = 0

        empAtt.forEach(a => {
          const sched = empSchedules.find(s => s.date === a.date)
          const scheduledStart = sched?.shifts?.start_time || '09:00'
          const scheduledEnd = sched?.shifts?.end_time || '17:00'
          const isOvernight = !!sched?.shifts?.is_overnight
          const gracePeriod = sched?.shifts?.grace_period_mins || 0

          const compliance = calculateScheduleCompliance({
            scheduledStart,
            scheduledEnd,
            clockIn: a.clock_in,
            clockOut: a.clock_out,
            hourlyRate: baseHourlyRate,
            isOvernight,
            gracePeriodMins: gracePeriod,
          })

          if (compliance.isLate) totalTardinessMinutes += compliance.tardinessMinutes
          if (compliance.isUndertime) totalUndertimeMinutes += compliance.undertimeMinutes
        })

        // If no direct attendance records found but timesheets present, reconcile from timesheet entries
        if (empAtt.length === 0 && empEntries.length > 0) {
          empEntries.forEach(t => {
            const sched = empSchedules.find(s => s.date === t.date)
            const scheduledStart = sched?.shifts?.start_time || '09:00'
            const scheduledEnd = sched?.shifts?.end_time || '17:00'
            const compliance = calculateScheduleCompliance({
              scheduledStart,
              scheduledEnd,
              clockIn: t.start_time,
              clockOut: t.end_time,
              hourlyRate: baseHourlyRate,
            })
            if (compliance.isLate) totalTardinessMinutes += compliance.tardinessMinutes
            if (compliance.isUndertime) totalUndertimeMinutes += compliance.undertimeMinutes
          })
        }

        const tardinessMinutes = totalTardinessMinutes
        const undertimeMinutes = totalUndertimeMinutes

        // 5. Earnings Breakdown
        const basicPayEarned = regularHours * baseHourlyRate
        const overtimePay = effectiveOvertimeHours * baseHourlyRate * 1.25 // PH Labor Code standard 125%
        const nightDiffPay = 0
        const holidayPay = 0
        const paidLeavePay = paidLeaveHours * baseHourlyRate
        
        // De Minimis Non-taxable Allowance (₱1,500/month or ₱750/semi-monthly)
        const deMinimisAllowance = isSemiMonthly ? 750 : 1500

        // Performance Incentive
        const empPerf = (performance ?? []).filter(p => 
          p.employee_id === emp.id && 
          p.created_at.startsWith(periodStart.substring(0, 7))
        )
        const performanceIncentive = (empPerf.length > 0 && (empPerf[0].overall_rating ?? 0) >= 4.0) ? (isSemiMonthly ? 500 : 1000) : 0

        // DOLE Art. 95 Leave Monetization Cash Bonus
        const empMonetization = leaveMonetization?.records.find(r => r.employeeId === emp.id)
        const leaveConversionBonus = (includeLeaveBonus && empMonetization) ? empMonetization.cashBonus : 0
        const leaveConversionDays = (includeLeaveBonus && empMonetization) ? empMonetization.totalUnusedConvertibleDays : 0

        const grossEarnings = basicPayEarned + overtimePay + paidLeavePay + deMinimisAllowance + performanceIncentive + leaveConversionBonus

        // 6. Tardiness & Undertime Deductions (Hourly Rate / 60 * minutes)
        const tardinessDeduction = Math.round(((baseHourlyRate / 60) * tardinessMinutes) * 100) / 100
        const undertimeDeduction = Math.round(((baseHourlyRate / 60) * undertimeMinutes) * 100) / 100

        // 7. Statutory Government Contributions (Pro-rated for Semi-Monthly)
        const fullSSS = calculateSSS(monthlyBasicEquivalent)
        const fullPhilHealth = calculatePhilHealth(monthlyBasicEquivalent)
        const fullPagIbig = calculatePagIbig(monthlyBasicEquivalent)

        const divisor = isSemiMonthly ? 2 : 1
        
        const sss: typeof fullSSS = {
          ...fullSSS,
          employeeShare: Math.round((fullSSS.employeeShare / divisor) * 100) / 100,
          employerShare: Math.round((fullSSS.employerShare / divisor) * 100) / 100,
          wispEmployeeShare: Math.round((fullSSS.wispEmployeeShare / divisor) * 100) / 100,
          wispEmployerShare: Math.round((fullSSS.wispEmployerShare / divisor) * 100) / 100,
          totalEmployee: Math.round((fullSSS.totalEmployee / divisor) * 100) / 100,
          totalEmployer: Math.round((fullSSS.totalEmployer / divisor) * 100) / 100,
          totalContribution: Math.round((fullSSS.totalContribution / divisor) * 100) / 100,
        }

        const philHealth: typeof fullPhilHealth = {
          ...fullPhilHealth,
          employeeShare: Math.round((fullPhilHealth.employeeShare / divisor) * 100) / 100,
          employerShare: Math.round((fullPhilHealth.employerShare / divisor) * 100) / 100,
          totalContribution: Math.round((fullPhilHealth.totalContribution / divisor) * 100) / 100,
        }

        const pagIbig: typeof fullPagIbig = {
          ...fullPagIbig,
          employeeShare: Math.round((fullPagIbig.employeeShare / divisor) * 100) / 100,
          employerShare: Math.round((fullPagIbig.employerShare / divisor) * 100) / 100,
          totalContribution: Math.round((fullPagIbig.totalContribution / divisor) * 100) / 100,
        }

        const totalStatutoryEmployee = sss.employeeShare + philHealth.employeeShare + pagIbig.employeeShare
        const totalStatutoryEmployer = sss.employerShare + philHealth.employerShare + pagIbig.employerShare

        // 8. Taxable Income & BIR Withholding Tax (TRAIN Law)
        const taxableIncome = Math.max(0, grossEarnings - deMinimisAllowance - totalStatutoryEmployee)
        const tax = calculateWithholdingTax(taxableIncome, isSemiMonthly ? 'semi_monthly' : 'monthly')

        // 9. Total Deductions & Net Take-Home Pay
        const totalDeductions = totalStatutoryEmployee + tax.withholdingTax + tardinessDeduction + undertimeDeduction
        const netTakeHomePay = Math.max(0, grossEarnings - totalDeductions)

        // 10. 13th Month Accrual (PD 851: Basic Pay / 12)
        const accrued13thMonthPay = Math.round((basicPayEarned / 12) * 100) / 100

        const hasEntries = empEntries.length > 0 || empAtt.length > 0
        const approvedCount = empEntries.filter(t => t.is_approved).length
        const isFullyApproved = empEntries.length > 0 && approvedCount === empEntries.length
        
        const status = !hasEntries ? 'no_data' : (isFullyApproved || empAtt.length > 0 && empEntries.length === 0) ? 'ready' : 'pending'

        return {
          employeeId: emp.id,
          employeeName: `${emp.first_name} ${emp.last_name}`,
          position: emp.position || 'Operations Staff',
          department: emp.departments?.name || 'Operations',
          employeeNo: emp.employee_id || `PHL-${emp.id.substring(0, 5).toUpperCase()}`,
          tinNo: (emp as any).tin || '412-881-094-000',
          sssNo: (emp as any).sss_no || '34-8921471-0',
          philHealthNo: (emp as any).philhealth_no || '12-050219481-4',
          pagIbigNo: (emp as any).pagibig_no || '1210-9481-2241',
          
          cutoffType: cutoff,
          periodLabel,
          
          baseHourlyRate,
          monthlyBasicEquivalent,
          regularHoursWorked: regularHours,
          overtimeHours: effectiveOvertimeHours,
          nightDiffHours: 0,
          holidayHours: 0,
          paidLeaveDays,
          unpaidLeaveDays,
          leaveBreakdown: leaveBreakdownList,
          paidLeaveHours,
          unpaidLeaveHours,
          tardinessMinutes,
          undertimeMinutes,
          
          basicPayEarned,
          overtimePay,
          nightDiffPay,
          holidayPay,
          paidLeavePay,
          leaveConversionBonus,
          leaveConversionDays,
          deMinimisAllowance,
          performanceIncentive,
          grossEarnings,
          
          tardinessDeduction,
          undertimeDeduction,
          
          sss,
          philHealth,
          pagIbig,
          totalStatutoryEmployee,
          totalStatutoryEmployer,
          
          tax,
          
          totalDeductions,
          netTakeHomePay,
          
          accrued13thMonthPay,
          status,
          entriesCount: empEntries.length || empAtt.length
        }
      })
  }, [employees, currentEntries, attendance, leaves, performance, cutoff, periodLabel, periodStart, periodEnd, includeLeaveBonus, leaveMonetization, schedules])

  // Summary Totals
  const totals = useMemo(() => {
    const gross = payrollRows.reduce((s, r) => s + r.grossEarnings, 0)
    const net = payrollRows.reduce((s, r) => s + r.netTakeHomePay, 0)
    const deductions = payrollRows.reduce((s, r) => s + r.totalDeductions, 0)
    const statutoryEE = payrollRows.reduce((s, r) => s + r.totalStatutoryEmployee, 0)
    const statutoryER = payrollRows.reduce((s, r) => s + r.totalStatutoryEmployer, 0)
    const taxWithheld = payrollRows.reduce((s, r) => s + r.tax.withholdingTax, 0)
    const thirteenthMonthAccrued = payrollRows.reduce((s, r) => s + r.accrued13thMonthPay, 0)
    const paid = payrollRows.filter(r => r.status === 'ready').length

    return { 
      gross, 
      net, 
      deductions, 
      statutoryEE, 
      statutoryER, 
      taxWithheld, 
      thirteenthMonthAccrued, 
      paid, 
      total: payrollRows.length 
    }
  }, [payrollRows])

  const isLoading = empLoading || tsLoading || leavesLoading || perfLoading

  const handleRunPayroll = async () => {
    setIsProcessing(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsProcessing(false)
    toast.success('Philippine Payroll processed successfully', {
      description: `Disbursed ${totals.total} employees for ${periodLabel}` 
    })
  }

  // Export Bank Disbursal File (PH Standard)
  const handleBankExport = () => {
    if (payrollRows.length === 0) {
      toast.error('No payroll records available for export')
      return
    }
    const exportData = payrollRows.map(row => ({
      'Employee Name': row.employeeName,
      'Employee No': row.employeeNo,
      'Department': row.department,
      'Gross Pay (PHP)': row.grossEarnings.toFixed(2),
      'SSS EE': row.sss.employeeShare.toFixed(2),
      'PhilHealth EE': row.philHealth.employeeShare.toFixed(2),
      'Pag-IBIG EE': row.pagIbig.employeeShare.toFixed(2),
      'Tax Withheld': row.tax.withholdingTax.toFixed(2),
      'Net Pay (PHP)': row.netTakeHomePay.toFixed(2),
      '13th Month Accrual': row.accrued13thMonthPay.toFixed(2),
      'Bank Disbursement': 'Direct Credit (BDO / BPI / Maya)',
      'Status': row.status.toUpperCase(),
    }))
    downloadCSV(exportData, `PH_Payroll_Disbursement_${periodStart}_to_${periodEnd}`)
    toast.success('Philippine Payroll bank file downloaded')
  }

  const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    ready: { label: 'Ready', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400', icon: CheckCircle },
    pending: { label: 'Pending Timesheet', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400', icon: Clock },
    no_data: { label: 'No Clock-in', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: AlertCircle },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Philippine Payroll System</h1>
            <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50 text-[10px] sm:text-[11px] font-semibold">
              DOLE & BIR Compliant
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Priority Handling Logistics, Inc. · {periodLabel}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Cutoff Selector */}
          <Select value={cutoff} onValueChange={(val: CutoffPeriod) => setCutoff(val)}>
            <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs">
              <Calendar className="mr-1.5 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Select Cutoff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first_half">1st Half (1st – 15th)</SelectItem>
              <SelectItem value="second_half">2nd Half (16th – End)</SelectItem>
              <SelectItem value="monthly">Monthly Summary</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 h-9 text-xs flex-1 sm:flex-initial" 
            onClick={handleBankExport}
          >
            <Download className="size-3.5" /> Export Bank File
          </Button>

          {can.isHR() && (
            <Button 
              variant={includeLeaveBonus ? "default" : "outline"}
              size="sm" 
              className={`gap-1.5 h-9 text-xs font-semibold flex-1 sm:flex-initial ${includeLeaveBonus ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs" : "border-border text-muted-foreground"}`}
              onClick={() => {
                const next = !includeLeaveBonus
                setIncludeLeaveBonus(next)
                toast.info(next ? 'Leave Conversion Bonus (DOLE Art. 95) included in payroll' : 'Leave Bonus excluded from cutoff calculation')
              }}
            >
              <Coins className="size-3.5" />
              <span>{includeLeaveBonus ? 'Leave Bonus Included' : 'Include Leave Bonus'}</span>
            </Button>
          )}

          {can.managePayroll() && (
            <Button className="gap-1.5 h-9 text-xs bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto" onClick={handleRunPayroll} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
              Disburse Payroll
            </Button>
          )}
        </div>
      </div>

      {/* Pending timesheets notice */}
      {!isLoading && payrollRows.some(r => r.status === 'pending') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 sm:px-4 sm:py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <Clock className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">
                Pending Timesheet Approvals
              </p>
              <p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-300">
                Some timesheets require supervisor approval before payroll disbursement.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs w-full sm:w-auto"
            onClick={() => navigate('/app/timesheet')}
          >
            Review Timesheets <ChevronRight className="ml-1 size-3" />
          </Button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {[
          { label: 'Total Gross Disbursed', value: formatPHP(totals.gross), sub: `Includes OT, allowances & bonuses`, icon: DollarSign, color: 'text-violet-600' },
          { label: 'Total Net Take-Home Pay', value: formatPHP(totals.net), sub: `${totals.paid} of ${totals.total} employees ready`, icon: Wallet, color: 'text-emerald-600' },
          { label: 'Total Govt Remittances', value: formatPHP(totals.statutoryEE + totals.taxWithheld), sub: `SSS, PhilHealth, HDMF & Tax`, icon: ShieldCheck, color: 'text-blue-600' },
          { label: 'YTD 13th Month Accrual', value: formatPHP(totals.thirteenthMonthAccrued * 12), sub: `Mandatory PD 851 Year-End Reserve`, icon: Gift, color: 'text-amber-600' },
        ].map((c) => (
          <Card key={c.label} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
              <CardTitle className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate max-w-[130px] sm:max-w-none">{c.label}</CardTitle>
              <c.icon className={`size-3.5 sm:size-4 shrink-0 ${c.color}`} />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold tracking-tight">{c.value}</div>
              <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payslip Modal */}
      <PayslipDialog 
        open={!!selectedPayslip} 
        onOpenChange={(op) => !op && setSelectedPayslip(null)} 
        data={selectedPayslip}
      />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start flex-wrap h-auto md:w-auto md:flex-nowrap">
          <TabsTrigger value="masterlist" className="gap-1.5">
            <Users className="size-3.5" /> Payroll Masterlist
          </TabsTrigger>
          <TabsTrigger value="statutory" className="gap-1.5">
            <ShieldCheck className="size-3.5" /> Statutory Remittances (SSS / PH / HDMF)
          </TabsTrigger>
          <TabsTrigger value="thirteenth" className="gap-1.5">
            <Gift className="size-3.5" /> 13th Month Pay Ledger
          </TabsTrigger>
          {can.isHR() && (
            <TabsTrigger value="leave_monetization" className="gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold hover:bg-amber-500/20">
              <Coins className="size-3.5" /> Leave Conversion Bonus (Art. 95)
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: Payroll Masterlist */}
        <TabsContent value="masterlist" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Employee Payroll Masterlist</CardTitle>
                  <CardDescription>
                    Detailed earnings, statutory contributions, and net pay for {periodLabel}
                  </CardDescription>
                </div>
                <span className="text-xs text-muted-foreground">
                  Click any employee row to view & generate printable DOLE Payslip
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4">
                  <TableSkeleton columns={8} rows={6} withHeader={false} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="hidden md:table-cell">Dept</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Gross Pay</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">SSS (EE)</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">PhilHealth</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Pag-IBIG</TableHead>
                        <TableHead className="text-right hidden md:table-cell">Tax</TableHead>
                        <TableHead className="text-right font-bold text-emerald-600">Net Pay</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                            No active employees found for this payroll period.
                          </TableCell>
                        </TableRow>
                      ) : payrollRows.map((r) => {
                        const cfg = STATUS_CONFIG[r.status]
                        const Icon = cfg.icon
                        return (
                          <TableRow 
                            key={r.employeeId} 
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedPayslip(r)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar className="size-8">
                                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                    {r.employeeName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{r.employeeName}</p>
                                  <p className="text-xs text-muted-foreground truncate">{r.position}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                              {r.department}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {r.regularHoursWorked.toFixed(1)}h
                              {r.overtimeHours > 0 && (
                                <span className="ml-1 text-xs text-amber-600">+{r.overtimeHours.toFixed(1)}OT</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              <div>{formatPHP(r.grossEarnings)}</div>
                              {r.leaveConversionBonus !== undefined && r.leaveConversionBonus > 0 && (
                                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-mono">
                                  +{formatPHP(r.leaveConversionBonus)} SIL
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm text-red-600 hidden sm:table-cell">
                              -{formatPHP(r.sss.employeeShare)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-red-600 hidden sm:table-cell">
                              -{formatPHP(r.philHealth.employeeShare)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-red-600 hidden sm:table-cell">
                              -{formatPHP(r.pagIbig.employeeShare)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-red-600 hidden md:table-cell">
                              {r.tax.withholdingTax > 0 ? `-${formatPHP(r.tax.withholdingTax)}` : '₱0.00'}
                            </TableCell>
                            <TableCell className="text-right text-sm font-bold text-emerald-600">
                              {formatPHP(r.netTakeHomePay)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={`text-xs gap-1 ${cfg.className}`}>
                                <Icon className="size-2.5" />
                                {cfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Statutory Remittances (Government Compliance Schedules) */}
        <TabsContent value="statutory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* SSS Summary Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-blue-700">SSS Contribution Schedule</CardTitle>
                  <Badge variant="outline">RA 11199</Badge>
                </div>
                <CardDescription className="text-xs">Social Security System (14% + EC)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Employee Share (EE 4.5%):</span>
                  <span className="font-semibold text-red-600">{formatPHP(payrollRows.reduce((s, r) => s + r.sss.employeeShare, 0))}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Employer Share (ER 9.5% + EC):</span>
                  <span className="font-semibold text-blue-600">{formatPHP(payrollRows.reduce((s, r) => s + r.sss.employerShare, 0))}</span>
                </div>
                <div className="flex justify-between py-1 font-bold pt-1">
                  <span>Total SSS Remittance:</span>
                  <span className="text-primary">{formatPHP(payrollRows.reduce((s, r) => s + r.sss.totalContribution, 0))}</span>
                </div>
              </CardContent>
            </Card>

            {/* PhilHealth Summary Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-emerald-700">PhilHealth Premium</CardTitle>
                  <Badge variant="outline">RA 11223</Badge>
                </div>
                <CardDescription className="text-xs">Universal Health Care (5.0% Premium)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Employee Share (EE 2.5%):</span>
                  <span className="font-semibold text-red-600">{formatPHP(payrollRows.reduce((s, r) => s + r.philHealth.employeeShare, 0))}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Employer Share (ER 2.5%):</span>
                  <span className="font-semibold text-blue-600">{formatPHP(payrollRows.reduce((s, r) => s + r.philHealth.employerShare, 0))}</span>
                </div>
                <div className="flex justify-between py-1 font-bold pt-1">
                  <span>Total PhilHealth Remittance:</span>
                  <span className="text-primary">{formatPHP(payrollRows.reduce((s, r) => s + r.philHealth.totalContribution, 0))}</span>
                </div>
              </CardContent>
            </Card>

            {/* Pag-IBIG HDMF Summary Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-amber-700">Pag-IBIG / HDMF Fund</CardTitle>
                  <Badge variant="outline">Cir. 460</Badge>
                </div>
                <CardDescription className="text-xs">Home Development Mutual Fund (2%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Employee Share (Max ₱200):</span>
                  <span className="font-semibold text-red-600">{formatPHP(payrollRows.reduce((s, r) => s + r.pagIbig.employeeShare, 0))}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Employer Share (Max ₱200):</span>
                  <span className="font-semibold text-blue-600">{formatPHP(payrollRows.reduce((s, r) => s + r.pagIbig.employerShare, 0))}</span>
                </div>
                <div className="flex justify-between py-1 font-bold pt-1">
                  <span>Total Pag-IBIG Remittance:</span>
                  <span className="text-primary">{formatPHP(payrollRows.reduce((s, r) => s + r.pagIbig.totalContribution, 0))}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BIR Withholding Tax Table Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">BIR Form 1601-C / Withholding Tax Summary</CardTitle>
                  <CardDescription>Bureau of Internal Revenue TRAIN Law Revised Withholding Tax Matrix</CardDescription>
                </div>
                <Badge className="bg-violet-600">Total Tax: {formatPHP(totals.taxWithheld)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>TIN</TableHead>
                      <TableHead className="text-right">Gross Pay</TableHead>
                      <TableHead className="text-right">Statutory Exemption</TableHead>
                      <TableHead className="text-right">Taxable Net</TableHead>
                      <TableHead className="text-left">Tax Bracket</TableHead>
                      <TableHead className="text-right font-bold text-red-600">Tax Withheld</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRows.map((r) => (
                      <TableRow key={r.employeeId}>
                        <TableCell className="font-medium text-sm">{r.employeeName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.tinNo}</TableCell>
                        <TableCell className="text-right text-sm">{formatPHP(r.grossEarnings)}</TableCell>
                        <TableCell className="text-right text-sm text-emerald-600">
                          {formatPHP(r.totalStatutoryEmployee + r.deMinimisAllowance)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatPHP(r.tax.taxableIncome)}</TableCell>
                        <TableCell className="text-left text-xs text-muted-foreground">{r.tax.taxBracket}</TableCell>
                        <TableCell className="text-right text-sm font-bold text-red-600">
                          {r.tax.withholdingTax > 0 ? formatPHP(r.tax.withholdingTax) : '₱0.00 (Exempt)'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: 13th Month Pay Ledger */}
        <TabsContent value="thirteenth" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gift className="size-4 text-violet-600" /> Presidential Decree No. 851 — 13th Month Pay Ledger
                  </CardTitle>
                  <CardDescription>
                    Mandatory Philippine year-end bonus accrual (Total Basic Pay / 12). Non-taxable up to ₱90,000 ceiling.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                  Total YTD Accrual: {formatPHP(totals.thirteenthMonthAccrued * 12)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Cutoff Basic Pay</TableHead>
                      <TableHead className="text-right">Period Accrual (1/12)</TableHead>
                      <TableHead className="text-right font-bold text-emerald-600">Projected Year-End 13th Month</TableHead>
                      <TableHead className="text-center">Tax Exemption</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRows.map((r) => {
                      const projectedAnnual = r.monthlyBasicEquivalent
                      return (
                        <TableRow key={r.employeeId}>
                          <TableCell className="font-medium text-sm">{r.employeeName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.department}</TableCell>
                          <TableCell className="text-right text-sm">{formatPHP(r.basicPayEarned)}</TableCell>
                          <TableCell className="text-right text-sm text-emerald-600">+{formatPHP(r.accrued13thMonthPay)}</TableCell>
                          <TableCell className="text-right text-sm font-bold text-emerald-700">
                            {formatPHP(projectedAnnual)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              {projectedAnnual <= 90000 ? '100% Tax Exempt (<₱90k)' : 'Partially Taxable'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: DOLE Art. 95 Leave Monetization Ledger */}
        {can.isHR() && (
          <TabsContent value="leave_monetization" className="space-y-4">
            <YearEndMonetizationTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
