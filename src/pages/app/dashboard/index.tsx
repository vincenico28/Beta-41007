import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Clock, Calendar, TrendingUp, TrendingDown, ArrowRight,
  CheckCircle2, XCircle, AlertCircle, UserCheck, Timer, Award,
  Building2, BarChart2, Activity, ShieldCheck, MapPin, Sparkles,
  Bell, FileText, DollarSign, ChevronRight, Zap, RefreshCw,
  Gift, HeartHandshake, Laptop, Radio, AlertTriangle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts'
import { format, subDays, isSameDay, parseISO, differenceInDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useEmployees } from '@/hooks/use-employees'
import { useAttendanceRange, useAttendance } from '@/hooks/use-attendance'
import { useLeaveRequests } from '@/hooks/use-leaves'
import { useAnnouncements, useDepartments } from '@/hooks/use-misc'
import { usePerformanceReviews } from '@/hooks/use-performance'
import { useAuthStore } from '@/stores/auth.store'
import { usePermissions } from '@/hooks/use-permissions'
import { GamificationLeaderboard } from '@/components/dashboard/GamificationLeaderboard'
import { getPhilippineHolidays, type PhilippineHoliday } from '@/utils/philippine-holidays'
import { formatPHP } from '@/utils/philippine-payroll'
import type { LeaveRequest } from '@/types'

const DEPT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
}

function StatCard({
  title, value, change, icon: Icon, color, loading, subtitle, trend, sparklineData,
}: {
  title: string; value: string | number; change?: string; icon: React.ElementType
  color: string; loading?: boolean; subtitle?: string; trend?: 'up' | 'down' | 'neutral'
  sparklineData?: number[]
}) {
  return (
    <Card className="overflow-hidden glass-card relative group border-border/70 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-4 sm:p-5 relative z-10">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">{title}</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{value}</p>
              
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {change && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    trend === 'up' || change.startsWith('+') 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {change.startsWith('+') ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {change}
                  </span>
                )}
                {subtitle && (
                  <span className="text-[11px] text-muted-foreground truncate font-medium">
                    {subtitle}
                  </span>
                )}
              </div>
            </div>
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${color} shadow-xs`}>
              <Icon className="size-5" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const getLeaveStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
    rejected: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400',
  }
  return map[status] ?? map.pending
}

export default function DashboardPage() {
  const { employee } = useAuthStore()
  const { can } = usePermissions()
  const { data: employees, isLoading: empLoading } = useEmployees()
  const { data: leaves, isLoading: leavesLoading } = useLeaveRequests()
  const { data: announcements } = useAnnouncements()
  const { data: departments } = useDepartments()
  const { data: performanceReviews } = usePerformanceReviews()

  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d')
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const endDate = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), 13), 'yyyy-MM-dd')
  const { data: attendanceData, isLoading: attLoading } = useAttendanceRange(startDate, endDate)
  const { data: todayRecords } = useAttendance()

  // High-level workforce stats
  const stats = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const todayAtt = attendanceData?.filter(a => a.date === todayStr) ?? []
    const presentToday = todayAtt.filter(a => a.status === 'present' || a.status === 'late').length
    const onTimeToday = todayAtt.filter(a => a.status === 'present').length
    const lateToday = todayAtt.filter(a => a.status === 'late').length
    const absentToday = todayAtt.filter(a => a.status === 'absent').length
    const onLeave = employees?.filter(e => e.status === 'on_leave').length ?? 0
    const pendingLeaves = leaves?.filter(l => l.status === 'pending').length ?? 0
    const totalActive = employees?.filter(e => e.status === 'active' || e.status === 'on_leave').length ?? 0

    // Weekday attendance velocity
    const weekdayRecords = attendanceData?.filter(a => {
      const d = new Date(a.date).getDay()
      return d !== 0 && d !== 6
    }) ?? []
    const totalTracked = weekdayRecords.length
    const totalPresent = weekdayRecords.filter(a => a.status === 'present' || a.status === 'late').length
    const avgAttendanceRate = totalTracked > 0 ? Math.round((totalPresent / totalTracked) * 100) : 0
    const onTimeRate = presentToday > 0 ? Math.round((onTimeToday / presentToday) * 100) : 100
    const attendanceTodayRate = totalActive > 0 ? Math.round((presentToday / totalActive) * 100) : 0
    
    // Performance stats
    const acknowledgedReviews = performanceReviews?.filter(r => r.status === 'acknowledged').length ?? 0
    const pendingAcks = performanceReviews?.filter(r => r.status === 'submitted').length ?? 0

    return { 
      presentToday, onTimeToday, lateToday, absentToday, onLeave, pendingLeaves, 
      totalActive, avgAttendanceRate, onTimeRate, attendanceTodayRate,
      acknowledgedReviews, pendingAcks 
    }
  }, [employees, attendanceData, leaves, performanceReviews])

  // Attendance Chart Data with 7d vs 14d switch
  const attendanceChartData = useMemo(() => {
    const count = timeRange === '7d' ? 7 : 14
    const days: Array<{ date: string; fullDate: string; present: number; late: number; absent: number }> = []
    
    for (let i = count - 1; i >= 0; i--) {
      const targetDate = subDays(new Date(), i)
      const dStr = format(targetDate, 'yyyy-MM-dd')
      const dayAtt = attendanceData?.filter(a => a.date === dStr) ?? []
      days.push({
        date: format(targetDate, count === 7 ? 'EEE' : 'MMM d'),
        fullDate: format(targetDate, 'MMM d, yyyy'),
        present: dayAtt.filter(a => a.status === 'present').length,
        late: dayAtt.filter(a => a.status === 'late').length,
        absent: dayAtt.filter(a => a.status === 'absent').length,
      })
    }
    return days
  }, [attendanceData, timeRange])

  // Department distribution
  const deptChartData = useMemo(() => {
    if (!employees) return []
    const deptMap: Record<string, number> = {}
    employees.forEach(e => {
      const dept = e.departments?.name ?? 'Logistics Operations'
      deptMap[dept] = (deptMap[dept] ?? 0) + 1
    })
    return Object.entries(deptMap).map(([name, value]) => ({ name, value }))
  }, [employees])

  // Upcoming Philippine Holidays (next 30 days)
  const upcomingHolidays = useMemo(() => {
    const today = new Date()
    const allHolidays = getPhilippineHolidays(today.getFullYear())
    return allHolidays
      .map(h => ({
        ...h,
        dateObj: parseISO(h.date),
        diffDays: differenceInDays(parseISO(h.date), today)
      }))
      .filter(h => h.diffDays >= 0 && h.diffDays <= 45)
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 3)
  }, [])

  const recentLeaves = leaves?.slice(0, 5) ?? []

  const attChartConfig = {
    present: { label: 'On-Time Present', color: '#10b981' },
    late: { label: 'Late Arrival', color: '#f59e0b' },
    absent: { label: 'Unexcused Absent', color: '#f43f5e' },
  }

  const hour = currentTime.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const roleLabel = employee?.role ? employee.role.replace('_', ' ').toUpperCase() : 'EMPLOYEE'

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={fadeUp} 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-primary/95 to-slate-900 p-6 text-white shadow-xl border border-white/10"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity className="size-64" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">
                <Sparkles className="size-3 text-amber-300" />
                Priority Handling Logistics, Inc.
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-bold uppercase">
                {roleLabel}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-white/80 font-mono">
                <Clock className="size-3.5 text-emerald-400" />
                {format(currentTime, 'hh:mm:ss a')} PHT (UTC+8)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greeting}, {employee?.first_name ?? 'Operations Leader'}! 👋
            </h1>
            <p className="text-sm text-white/80 max-w-xl">
              {format(currentTime, 'EEEE, MMMM d, yyyy')} &bull; Logistics Hub is operating at <span className="text-emerald-300 font-bold">{stats.attendanceTodayRate}% attendance</span> with real-time biometric GPS compliance.
            </p>
          </div>

          {/* Quick Action Buttons Ribbon */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/app/attendance">
              <Button size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md">
                <Clock className="size-4" />
                Clock In / Out
              </Button>
            </Link>
            <Link to="/app/leaves">
              <Button size="sm" variant="secondary" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md font-semibold">
                <Calendar className="size-4" />
                Request Leave
              </Button>
            </Link>
            {can.createAnnouncements() && (
              <Link to="/app/announcements">
                <Button size="sm" variant="secondary" className="gap-2 bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md font-semibold">
                  <Bell className="size-4" />
                  Post Memo
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Live Logistics Operations Status Strip */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-white/90">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GPS Geofence: <strong>Active (Pasay Hub)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>Biometric Engine: <strong>Online</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-400" />
            <span>DOLE Compliance: <strong>Form 48 Active</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400" />
            <span>Pending Approvals: <strong>{stats.pendingLeaves + stats.pendingAcks} Items</strong></span>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            title: 'Active Workforce',
            value: empLoading ? '...' : stats.totalActive,
            icon: Users,
            color: 'bg-primary/10 text-primary',
            loading: empLoading,
            subtitle: `${departments?.length || 5} Operations Depts`,
            change: '+100% Retained',
            trend: 'up' as const,
          },
          {
            title: 'On-Duty Today',
            value: empLoading || attLoading ? '...' : stats.presentToday,
            icon: UserCheck,
            color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
            loading: empLoading || attLoading,
            subtitle: `${stats.onTimeRate}% On-Time Punctuality`,
            change: `${stats.attendanceTodayRate}% Attended`,
            trend: 'up' as const,
          },
          {
            title: 'On Approved Leave',
            value: empLoading ? '...' : stats.onLeave,
            icon: Calendar,
            color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
            loading: empLoading,
            subtitle: `${stats.pendingLeaves} requests pending review`,
            change: stats.pendingLeaves > 0 ? `${stats.pendingLeaves} to review` : 'All cleared',
            trend: stats.pendingLeaves > 0 ? ('down' as const) : ('up' as const),
          },
          {
            title: 'Late Arrivals',
            value: empLoading || attLoading ? '...' : stats.lateToday,
            icon: Timer,
            color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
            loading: empLoading || attLoading,
            subtitle: 'Exceeded schedule grace period',
            change: stats.lateToday === 0 ? 'Zero Delays' : `${stats.lateToday} Flagged`,
            trend: stats.lateToday === 0 ? ('up' as const) : ('down' as const),
          },
        ].map((s, i) => (
          <motion.div key={s.title} initial="hidden" animate="visible" custom={i} variants={fadeUp}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Attendance Velocity Area Chart */}
        <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp} className="lg:col-span-2">
          <Card className="glass-card h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  Workforce Attendance & Compliance Velocity
                </CardTitle>
                <CardDescription>Biometric & GPS clock-in logs across Philippines operations</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-muted/60 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setTimeRange('7d')}
                    className={`px-2.5 py-1 rounded-md transition-all ${timeRange === '7d' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground'}`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setTimeRange('14d')}
                    className={`px-2.5 py-1 rounded-md transition-all ${timeRange === '14d' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground'}`}
                  >
                    14 Days
                  </button>
                </div>
                <Link to="/app/attendance">
                  <Button variant="ghost" size="icon" className="size-8" title="View Full Attendance">
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={attChartConfig} className="min-h-[250px] w-full">
                <AreaChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fillAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 11 }} 
                    tickMargin={10} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 11 }} 
                    tickMargin={10} 
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="present" 
                    name="On-Time"
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#fillPresent)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="late" 
                    name="Late Arrival"
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#fillLate)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="absent" 
                    name="Unexcused Absent"
                    stroke="#f43f5e" 
                    strokeWidth={1.5}
                    fillOpacity={1} 
                    fill="url(#fillAbsent)" 
                  />
                </AreaChart>
              </ChartContainer>

              <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span>On-Time Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500" />
                  <span>Late Arrival</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500" />
                  <span>Absent</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Logistics Distribution Donut */}
        <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp} className="col-span-1">
          <Card className="h-full glass-card flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Department Headcount
              </CardTitle>
              <CardDescription>Logistics operations staffing</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1">
              <div className="relative my-2 flex justify-center">
                <PieChart width={170} height={170}>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', background: 'var(--background)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Pie 
                    data={deptChartData} 
                    cx={80} 
                    cy={80} 
                    innerRadius={48} 
                    outerRadius={75} 
                    paddingAngle={4} 
                    dataKey="value"
                    stroke="none"
                  >
                    {deptChartData.map((_, idx) => (
                      <Cell key={idx} fill={DEPT_COLORS[idx % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black leading-none">{stats.totalActive}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Staff</span>
                </div>
              </div>

              <div className="w-full space-y-1.5 pt-2 border-t border-border/50">
                {deptChartData.slice(0, 4).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="size-2 rounded-full shrink-0" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                      <span className="text-muted-foreground truncate">{d.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gamification Leaderboard */}
        <motion.div initial="hidden" animate="visible" custom={5.5} variants={fadeUp} className="col-span-1">
          <GamificationLeaderboard />
        </motion.div>
      </div>

      {/* Bottom Hub: Philippine Holidays Radar, Recent Leaves, and Official Corporate Announcements */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* DOLE Holiday & Compliance Radar */}
        <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="col-span-1">
          <Card className="h-full glass-card flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Gift className="size-4 text-rose-500" />
                  Philippine Statutory Holidays
                </CardTitle>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-rose-600 border-rose-200">
                  DOLE Proclamation
                </Badge>
              </div>
              <CardDescription>Upcoming official holidays & premium wage rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingHolidays.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No statutory holidays in the next 30 days.
                </div>
              ) : (
                upcomingHolidays.map(h => (
                  <div key={h.date} className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-foreground">{h.name}</p>
                        <p className="text-[11px] text-muted-foreground">{format(h.dateObj, 'EEEE, MMMM d, yyyy')}</p>
                      </div>
                      <Badge className={h.type === 'regular' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px]' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px]'}>
                        {h.type === 'regular' ? 'Regular 200%' : 'Special 130%'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground border-t border-border/40">
                      <span>{h.diffDays === 0 ? 'Today!' : h.diffDays === 1 ? 'Tomorrow' : `In ${h.diffDays} days`}</span>
                      <span className="font-semibold text-foreground">
                        {h.type === 'regular' ? 'Double Pay if Worked' : '+30% Premium Pay'}
                      </span>
                    </div>
                  </div>
                ))
              )}

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs">
                <span className="font-semibold text-primary">Monthly Attendance Rate</span>
                <span className="font-bold font-mono text-primary text-sm">{stats.avgAttendanceRate}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Leave Requests Hub */}
        <motion.div initial="hidden" animate="visible" custom={6.5} variants={fadeUp} className="col-span-1">
          <Card className="h-full glass-card flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Leave Requests
                </CardTitle>
                <CardDescription>Recent applications & pending approvals</CardDescription>
              </div>
              <Link to="/app/leaves">
                <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold">
                  View all <ArrowRight className="size-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5 flex-1">
              {recentLeaves.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No recent leave requests</div>
              ) : (
                recentLeaves.map((lr: LeaveRequest) => (
                  <div key={lr.id} className="flex items-center gap-3 rounded-xl border border-border/80 p-2.5 transition-colors hover:bg-muted/40">
                    <Avatar className="size-9 shrink-0 border border-border">
                      {lr.employees?.avatar_url && <AvatarImage src={lr.employees.avatar_url} className="object-cover" />}
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {`${lr.employees?.first_name?.[0] ?? ''}${lr.employees?.last_name?.[0] ?? ''}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground">
                        {lr.employees?.first_name} {lr.employees?.last_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lr.leave_types?.name} &bull; {lr.total_days} day{lr.total_days !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${getLeaveStatusColor(lr.status)}`}>
                        {lr.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {format(new Date(lr.start_date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Corporate Announcements & Memos */}
        <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp} className="col-span-1">
          <Card className="h-full glass-card flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bell className="size-4 text-amber-500" />
                  Official Announcements
                </CardTitle>
                <CardDescription>Internal corporate communications</CardDescription>
              </div>
              <Link to="/app/announcements">
                <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold">
                  View all <ArrowRight className="size-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 flex-1">
              {announcements?.slice(0, 3).map((ann: any) => (
                <div key={ann.id} className="space-y-1.5 rounded-xl border border-border/80 p-3 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {ann.is_pinned && <Badge variant="secondary" className="text-[9px] font-bold">📌 Pinned</Badge>}
                      <Badge className={`text-[9px] font-bold ${
                        ann.type === 'urgent' 
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {ann.type.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {ann.published_at ? format(new Date(ann.published_at), 'MMM d') : 'Recent'}
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-tight line-clamp-1">{ann.title}</p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">{ann.content}</p>
                </div>
              ))}
              {(!announcements || announcements.length === 0) && (
                <p className="py-8 text-center text-xs text-muted-foreground">No active announcements</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

