import React from 'react'
import { motion } from 'framer-motion'
import {
  Clock, QrCode, MapPin, Calendar, FileSpreadsheet,
  HeartHandshake, TrendingUp, BarChart3, Award, Bell,
  ShieldCheck, Sparkles, UserCheck, ArrowRight, Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FeatureItem {
  id: string
  title: string
  tag: string
  description: string
  icon: React.ElementType
  color: string
  stat: string
}

const FEATURES: FeatureItem[] = [
  {
    id: 'face-verification',
    title: 'Biometric Face Verification',
    tag: 'Anti-Spoof Vision',
    description: 'Sub-second AI facial landmark recognition with anti-photo liveness verification to eliminate proxy attendance.',
    icon: UserCheck,
    color: 'from-blue-500 to-indigo-500 text-blue-500',
    stat: '0.28s Auth Speed',
  },
  {
    id: 'qr-attendance',
    title: 'Dynamic QR Attendance',
    tag: 'Encrypted Timecards',
    description: 'Time-rotating QR codes generated per device session, preventing screenshot sharing and offsite validation.',
    icon: QrCode,
    color: 'from-cyan-500 to-blue-500 text-cyan-500',
    stat: 'Dynamic Rotating Key',
  },
  {
    id: 'gps-tracking',
    title: 'Spatial GPS Geofencing',
    tag: 'Hardware-Grade Bounds',
    description: 'Enforces strict 100m radial facility boundaries with built-in speed spoofing and mock-location detection.',
    icon: MapPin,
    color: 'from-rose-500 to-pink-500 text-rose-500',
    stat: '100m Radial Boundary',
  },
  {
    id: 'smart-scheduling',
    title: 'Smart Roster & Shift AI',
    tag: 'Zero-Conflict Engine',
    description: 'High-speed bulk schedule builder with automatic coverage gap alerts and fatigue rest compliance.',
    icon: Calendar,
    color: 'from-amber-500 to-orange-500 text-amber-500',
    stat: '1-Click Bulk Creator',
  },
  {
    id: 'digital-timesheets',
    title: 'Civil Service Form 48 DTR',
    tag: 'DOLE Statutory Formats',
    description: 'Direct generation of official Form 48 Daily Time Records with itemized regular hours, overtime, and tardiness.',
    icon: FileSpreadsheet,
    color: 'from-emerald-500 to-teal-500 text-emerald-500',
    stat: '100% Payroll Ready',
  },
  {
    id: 'leave-management',
    title: 'Philippine Leave Engine',
    tag: 'Republic Acts & Art. 95',
    description: 'Automated policy handling for RA 11210 (105-Day Maternity), RA 8187 (Paternity), and Year-End Cash Monetization.',
    icon: HeartHandshake,
    color: 'from-purple-500 to-violet-500 text-purple-500',
    stat: '12+ Statutory Types',
  },
  {
    id: 'overtime-management',
    title: 'Overtime & Holiday Rules',
    tag: '125% & 200% Multipliers',
    description: 'Calculates 125% regular overtime, 130% special non-working days, and 200% regular holiday double wages automatically.',
    icon: TrendingUp,
    color: 'from-orange-500 to-amber-500 text-orange-500',
    stat: 'Automated Multipliers',
  },
  {
    id: 'workforce-analytics',
    title: 'Real-Time Operations Analytics',
    tag: 'Executive KPI Cockpit',
    description: 'Sub-second real-time charts tracking attendance velocity, department capacity, and labor cost efficiency.',
    icon: BarChart3,
    color: 'from-blue-600 to-cyan-500 text-blue-500',
    stat: 'Real-Time Telemetry',
  },
  {
    id: 'employee-performance',
    title: '360° Appraisals & Merits',
    tag: 'Competency Scoring',
    description: 'Formal 5-criteria performance appraisal engine with digital acknowledgments and printable DOLE score sheets.',
    icon: Award,
    color: 'from-indigo-500 to-purple-500 text-indigo-500',
    stat: 'Formal DOLE Matrix',
  },
  {
    id: 'notifications',
    title: 'Push Alerts & Corporate Memos',
    tag: 'Targeted Broadcasts',
    description: 'Instant targeted push notifications with PDF memo attachments, weather bulletins, and urgent operational notices.',
    icon: Bell,
    color: 'from-pink-500 to-rose-500 text-pink-500',
    stat: 'Multi-Channel Push',
  },
]

export function FeatureCards3D() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            <span>Comprehensive Feature Suite</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-foreground">
            Engineered for High-Throughput Operations
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            10 enterprise-grade modules built to solve every layer of workforce tracking, compliance, scheduling, and labor administration.
          </p>
        </div>

        {/* 10 Feature 3D Perspective Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={feat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="group relative p-6 rounded-3xl bg-card/80 border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Ambient hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${feat.color} text-white shadow-lg`}>
                      <Icon className="size-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      {feat.tag}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black font-heading text-foreground group-hover:text-primary transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-border/60 flex items-center justify-between text-xs relative z-10">
                  <span className="font-mono font-bold text-foreground">{feat.stat}</span>
                  <span className="text-primary font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="size-3" />
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
