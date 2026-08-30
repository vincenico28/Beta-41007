import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, MapPin, Calendar, FileText, HeartHandshake,
  BarChart3, CheckCircle2, AlertTriangle, ShieldCheck,
  UserCheck, QrCode, Sparkles, ArrowRight, Layers,
  TrendingUp, Users, DollarSign, Activity, FileSpreadsheet,
  Award, Cpu, Check, Laptop
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface SceneData {
  id: string
  number: string
  title: string
  subtitle: string
  description: string
  icon: React.ElementType
  badge: string
  metrics: Array<{ label: string; value: string }>
}

const SCENES: SceneData[] = [
  {
    id: 'attendance',
    number: '01',
    title: 'Accurate Attendance. Verified in Real Time.',
    subtitle: 'Biometric & Spatial Verification',
    description: 'Eliminate buddy punching and timecard fraud forever. Every clock-in is validated using real-time AI facial recognition, encrypted QR timecards, and sub-second hardware geolocation within certified facility perimeters.',
    icon: Clock,
    badge: 'Hardware Anti-Spoof',
    metrics: [
      { label: 'Facial Auth Speed', value: '0.28s' },
      { label: 'Timecard Fraud', value: '0.00%' },
      { label: 'Liveness Accuracy', value: '99.9%' },
    ],
  },
  {
    id: 'gps-tracking',
    number: '02',
    title: 'Know Where Your Workforce Is.',
    subtitle: 'Spatial Facility Geofencing',
    description: 'Enforce strict 100m radial geofencing per warehouse bay and terminal hub. The system automatically detects mocked GPS locations, high-speed spoofing, and out-of-bounds clock-ins with instant supervisor telemetry.',
    icon: MapPin,
    badge: '100m Radial Geofence',
    metrics: [
      { label: 'Boundary Range', value: '100 Meters' },
      { label: 'Anti-Spoof Check', value: 'Speed & Altitude' },
      { label: 'Active GPS Hubs', value: 'Multi-Terminal' },
    ],
  },
  {
    id: 'scheduling',
    number: '03',
    title: 'Smarter Scheduling. Better Operations.',
    subtitle: 'AI-Assisted Roster Optimization',
    description: 'Build months of flawless shift schedules in seconds. Gemini AI scans for coverage gaps, compliance limits, rest day violations, and employee skill requirements to deliver conflict-free logistics staffing.',
    icon: Calendar,
    badge: 'Automated Gap Detection',
    metrics: [
      { label: 'Roster Build Time', value: '< 2 Seconds' },
      { label: 'Schedule Conflicts', value: '0 Detected' },
      { label: 'Shift Compliance', value: '100% Guaranteed' },
    ],
  },
  {
    id: 'timesheets',
    number: '04',
    title: 'From Attendance to Accurate Timesheets.',
    subtitle: 'Automated DOLE Form 48 DTR',
    description: 'Raw attendance records instantly flow into fully computed, payroll-ready timesheets. Automatic 125% regular overtime, night differentials, tardiness penalties, and undertime deductions without manual spreadsheets.',
    icon: FileSpreadsheet,
    badge: 'Civil Service Form 48',
    metrics: [
      { label: 'Manual Work Cut', value: '92%' },
      { label: 'Payroll Ready', value: 'Instant Export' },
      { label: 'Overtime Accuracy', value: '100% Calculated' },
    ],
  },
  {
    id: 'leave-management',
    number: '05',
    title: 'Leave Management Without the Paperwork.',
    subtitle: 'Philippine Statutory Leave Engine',
    description: 'Full compliance with RA 11210 (105-Day Maternity), RA 8187 (Paternity), RA 9262 (VAWC), Solo Parent Leave, and DOLE Art. 95 Year-End Cash Monetization. Instant multi-tier supervisor approvals with automated balance deduction.',
    icon: HeartHandshake,
    badge: 'Labor Code Compliant',
    metrics: [
      { label: 'Statutory Types', value: '12+ DOLE Rules' },
      { label: 'Approval Speed', value: '1-Click Review' },
      { label: 'Balance Accuracy', value: 'Auto-Deducted' },
    ],
  },
  {
    id: 'analytics',
    number: '06',
    title: 'Turn Workforce Data Into Decisions.',
    subtitle: 'Executive Operations Cockpit',
    description: 'Transform millions of attendance and labor data points into executive clarity. Track attendance velocity, department capacity, overtime expenditure trends, and employee performance scores in real time.',
    icon: BarChart3,
    badge: 'Predictive Intelligence',
    metrics: [
      { label: 'Real-Time Sync', value: '< 100ms' },
      { label: 'Overtime Visibility', value: 'Live Radar' },
      { label: 'Executive Reports', value: '1-Click PDF' },
    ],
  },
]

export function ScrollStorytelling() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)
  const current = SCENES[activeSceneIndex]

  return (
    <section id="storytelling" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-muted/20 border-y border-border/40">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <Layers className="size-3.5" />
            <span>Interactive Storytelling Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-foreground">
            From Arrival to Payroll.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
              Every Workflow Automated.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Experience how the platform resolves every critical bottleneck across attendance, spatial tracking, rostering, compliance, leave administration, and executive analytics.
          </p>
        </div>

        {/* Step Navigation Pill Selector */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SCENES.map((scene, idx) => {
            const Icon = scene.icon
            const isActive = idx === activeSceneIndex
            return (
              <button
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-700 shadow-lg shadow-blue-500/10 scale-105'
                    : 'bg-card/70 text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <span className={`size-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {scene.number}
                </span>
                <Icon className="size-3.5" />
                <span>{scene.badge}</span>
              </button>
            )
          })}
        </div>

        {/* Main 3D Story Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          {/* Left: Narrative & Metrics */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-primary uppercase tracking-widest">
                      PHASE {current.number} / 06 &bull; {current.subtitle}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-heading text-foreground leading-tight">
                    {current.title}
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {current.description}
                </p>

                {/* Live Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-card border border-border/70 shadow-sm">
                  {current.metrics.map((m) => (
                    <div key={m.label} className="space-y-1">
                      <p className="text-lg sm:text-xl font-black font-heading text-foreground">{m.value}</p>
                      <p className="text-[11px] text-muted-foreground font-medium leading-tight">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Step controls */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeSceneIndex === 0}
                    onClick={() => setActiveSceneIndex((prev) => Math.max(0, prev - 1))}
                    className="font-bold text-xs"
                  >
                    Previous Phase
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveSceneIndex((prev) => (prev + 1) % SCENES.length)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5"
                  >
                    {activeSceneIndex === SCENES.length - 1 ? 'Restart Walkthrough' : 'Next Phase'}
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Interactive 3D Mockup Visualizer */}
          <div className="lg:col-span-7 perspective-1200 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="w-full max-w-xl glass-panel-3d rounded-3xl p-6 border border-white/20 dark:border-white/10 shadow-2xl relative select-none overflow-hidden"
              >
                {/* Visualizer Scene 01: Biometric & QR Attendance */}
                {activeSceneIndex === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-foreground">Facial AI + QR Kiosk v3.4</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                        VERIFIED 0.28s
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Biometric Viewfinder */}
                      <div className="bg-slate-950 rounded-2xl p-4 border border-cyan-500/30 text-white space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between text-xs text-cyan-400">
                          <span>FACIAL LANDMARKS</span>
                          <span className="font-mono">98 POINTS</span>
                        </div>
                        <div className="h-28 bg-slate-900 rounded-xl flex items-center justify-center relative border border-cyan-400/40">
                          <div className="size-16 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
                            <UserCheck className="size-8 text-cyan-400" />
                          </div>
                          <span className="absolute bottom-2 text-[9px] font-mono text-emerald-400">MATCH: J. DELA CRUZ</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium text-center">Biometric Identity Confirmed</p>
                      </div>

                      {/* QR Timecard & GPS Bound */}
                      <div className="bg-card rounded-2xl p-4 border border-border flex flex-col justify-between space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">Dynamic Timecard</span>
                          <QrCode className="size-4 text-primary" />
                        </div>
                        <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">PUNCH IN:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">07:58:14 AM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">LOCATION:</span>
                            <span className="font-bold text-foreground">Warehouse Bay 02</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">STATUS:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">ON-TIME (0m Late)</span>
                          </div>
                        </div>
                        <Badge className="w-full justify-center bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                          DOLE FORM 48 LOGGED
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visualizer Scene 02: GPS Facility Geofence */}
                {activeSceneIndex === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-rose-500" />
                        <span className="text-xs font-bold text-foreground">Spatial Geofence & Perimeter Radar</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                        100M ACTIVE BOUND
                      </Badge>
                    </div>

                    <div className="relative h-60 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                      
                      {/* Radar sweep */}
                      <div className="relative size-44 rounded-full border border-blue-500/40 bg-blue-500/5 flex items-center justify-center">
                        <div className="absolute inset-4 rounded-full border border-dashed border-blue-400/30" />
                        <div className="absolute inset-8 rounded-full border border-blue-500/20" />
                        
                        {/* Center Hub */}
                        <div className="size-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold shadow-lg shadow-blue-500/50">
                          HUB
                        </div>

                        {/* Worker Beacon 1 */}
                        <div className="absolute top-6 right-8 flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-md border border-emerald-500/40 text-[9px] text-emerald-400 font-mono">
                          <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>EMP-04 (0m)</span>
                        </div>

                        {/* Worker Beacon 2 */}
                        <div className="absolute bottom-6 left-8 flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-md border border-emerald-500/40 text-[9px] text-emerald-400 font-mono">
                          <span className="size-2 rounded-full bg-emerald-400" />
                          <span>EMP-12 (14m)</span>
                        </div>
                      </div>

                      {/* Anti-spoofing detector HUD */}
                      <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300">
                        <span>ALTITUDE: 12.4m &bull; SPEED: 0.4 km/h (Valid Walk)</span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                        <span>ANTI-SPOOF: PASSED</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visualizer Scene 03: Smart Scheduling */}
                {activeSceneIndex === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-amber-500" />
                        <span className="text-xs font-bold text-foreground">Gemini AI Shift Matrix</span>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px] font-bold">
                        ZERO CONFLICTS
                      </Badge>
                    </div>

                    <div className="space-y-2.5">
                      {/* Shift Row 1 */}
                      <div className="p-3 bg-card rounded-xl border border-border/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                            AM
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">Ground Logistics Handling (06:00 - 14:00)</p>
                            <p className="text-[10px] text-muted-foreground">8 Staff Assigned &bull; 100% Coverage Target</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-[10px] font-bold">
                          LOCKED
                        </Badge>
                      </div>

                      {/* Shift Row 2 */}
                      <div className="p-3 bg-card rounded-xl border border-border/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            PM
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">Air Freight Sorting & Dispatch (14:00 - 22:00)</p>
                            <p className="text-[10px] text-muted-foreground">6 Staff Assigned &bull; Skill-matched forklift operators</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-[10px] font-bold">
                          LOCKED
                        </Badge>
                      </div>

                      {/* AI Optimization Alert */}
                      <div className="p-2.5 bg-gradient-to-r from-purple-500/10 to-primary/10 rounded-xl border border-purple-500/30 flex items-center gap-2 text-xs">
                        <Sparkles className="size-4 text-purple-500 shrink-0" />
                        <span className="text-foreground text-[11px] font-medium">
                          AI auto-filled 24 shifts respecting mandatory 11-hour rest periods between consecutive shifts.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visualizer Scene 04: Digital Timesheets */}
                {activeSceneIndex === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="size-4 text-emerald-500" />
                        <span className="text-xs font-bold text-foreground">Civil Service Form 48 DTR Ledger</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-[10px] font-bold">
                        PAYROLL READY
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="grid grid-cols-5 p-2 bg-muted/60 rounded-lg text-muted-foreground font-bold text-[10px]">
                        <span>DATE</span>
                        <span>AM IN</span>
                        <span>PM OUT</span>
                        <span>REG (H)</span>
                        <span>OT (125%)</span>
                      </div>

                      <div className="grid grid-cols-5 p-2 bg-card rounded-lg border border-border items-center">
                        <span className="font-bold text-foreground">AUG 24</span>
                        <span className="text-emerald-600 dark:text-emerald-400">07:58</span>
                        <span className="text-emerald-600 dark:text-emerald-400">17:02</span>
                        <span>8.0h</span>
                        <span className="text-primary font-bold">0.0h</span>
                      </div>

                      <div className="grid grid-cols-5 p-2 bg-card rounded-lg border border-border items-center">
                        <span className="font-bold text-foreground">AUG 25</span>
                        <span className="text-emerald-600 dark:text-emerald-400">07:55</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">19:30</span>
                        <span>8.0h</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">+2.5h</span>
                      </div>

                      <div className="grid grid-cols-5 p-2 bg-amber-500/10 rounded-lg border border-amber-500/30 items-center text-amber-700 dark:text-amber-300">
                        <span className="font-bold">AUG 26</span>
                        <span>HOLIDAY</span>
                        <span>WORKED</span>
                        <span>8.0h</span>
                        <span className="font-bold">200% RATE</span>
                      </div>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">Gross Cutoff Computation:</span>
                      <span className="font-bold text-primary font-mono text-sm">₱28,450.00 Net Take-Home</span>
                    </div>
                  </div>
                )}

                {/* Visualizer Scene 05: Leave Management */}
                {activeSceneIndex === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="size-4 text-rose-500" />
                        <span className="text-xs font-bold text-foreground">RA 11210 & DOLE Statutory Leave Flow</span>
                      </div>
                      <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/30 text-[10px] font-bold">
                        100% PAPERLESS
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Leave Application Card */}
                      <div className="p-3.5 bg-card rounded-xl border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">Maria Santos</span>
                            <Badge variant="outline" className="text-[9px]">Logistics Planner</Badge>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px]">
                            MATERNITY (RA 11210)
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          105 Calendar Days with Full Pay &bull; Pre-natal & Post-natal Coverage
                        </p>
                      </div>

                      {/* 3-Tier Approval Path */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="size-3.5 mx-auto mb-0.5" />
                          <span>1. Supervisor</span>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="size-3.5 mx-auto mb-0.5" />
                          <span>2. HR Director</span>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold">
                          <Check className="size-3.5 mx-auto mb-0.5" />
                          <span>3. Balance Synced</span>
                        </div>
                      </div>

                      {/* Statutory Leave Balances */}
                      <div className="p-2.5 bg-muted/40 rounded-xl text-[11px] flex justify-between font-mono">
                        <span>Vacation: 12d</span>
                        <span>Sick: 15d</span>
                        <span>Art. 95 Monetization: Eligible</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visualizer Scene 06: Workforce Analytics */}
                {activeSceneIndex === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="size-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">Real-Time Operational Radar</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                        98.4% EFFICIENCY
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-card rounded-2xl border border-border space-y-1 text-center">
                        <p className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">97.8%</p>
                        <p className="text-[11px] text-muted-foreground font-medium">On-Time Attendance Rate</p>
                      </div>
                      <div className="p-3.5 bg-card rounded-2xl border border-border space-y-1 text-center">
                        <p className="text-2xl font-black font-heading text-blue-600 dark:text-blue-400">₱0.00</p>
                        <p className="text-[11px] text-muted-foreground font-medium">Unbudgeted Overtime Leakage</p>
                      </div>
                    </div>

                    {/* Department Progress Bars */}
                    <div className="space-y-2 p-3 bg-muted/30 rounded-2xl border border-border/60">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-foreground">Pasay Freight Terminal</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">99.2%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99.2%' }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-foreground">Ground Dispatch Hub</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">96.5%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '96.5%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
