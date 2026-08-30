import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers, Clock, MapPin, Calendar, FileText, HeartHandshake,
  BarChart3, Users, Bell, Zap, ShieldCheck, ArrowRight,
  Database, Cpu
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface ArchitectureNode {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  color: string
  description: string
  position: string
  badge: string
}

const MODULES: ArchitectureNode[] = [
  {
    id: 'attendance',
    title: 'Attendance',
    subtitle: 'Biometric & QR Verification',
    icon: Clock,
    color: 'from-blue-500 to-indigo-500 text-blue-500',
    description: 'Real-time camera liveness and dynamic QR codes eliminate buddy punching with 0.28s verification.',
    position: 'top-left',
    badge: '0.28s Auth',
  },
  {
    id: 'gps',
    title: 'GPS Tracking',
    subtitle: 'Spatial Radial Geofence',
    icon: MapPin,
    color: 'from-rose-500 to-pink-500 text-rose-500',
    description: 'Hardware geolocation enforcing 100m radial bounds around terminal bays and warehouses.',
    position: 'top-center',
    badge: '100m Bound',
  },
  {
    id: 'scheduling',
    title: 'Scheduling',
    subtitle: 'Smart Roster & Shift AI',
    icon: Calendar,
    color: 'from-amber-500 to-orange-500 text-amber-500',
    description: 'Automated gap auditing and bulk shift creation respecting mandatory rest periods.',
    position: 'top-right',
    badge: 'Zero Conflicts',
  },
  {
    id: 'timesheets',
    title: 'Timesheets',
    subtitle: 'DOLE Form 48 DTR Engine',
    icon: FileText,
    color: 'from-emerald-500 to-teal-500 text-emerald-500',
    description: 'Auto-computed 125% regular overtime, night differentials, and holiday double pay.',
    position: 'middle-right',
    badge: 'Payroll Ready',
  },
  {
    id: 'leave',
    title: 'Leave Management',
    subtitle: 'Statutory Benefits & Balances',
    icon: HeartHandshake,
    color: 'from-purple-500 to-violet-500 text-purple-500',
    description: 'Full compliance with RA 11210 (Maternity), RA 8187 (Paternity), and Art. 95 Monetization.',
    position: 'bottom-right',
    badge: 'DOLE Compliant',
  },
  {
    id: 'analytics',
    title: 'Workforce Analytics',
    subtitle: 'Operations Cockpit & KPIs',
    icon: BarChart3,
    color: 'from-cyan-500 to-blue-500 text-cyan-500',
    description: 'Sub-second real-time telemetry tracking attendance velocity and labor expenditure.',
    position: 'bottom-center',
    badge: 'Real-Time Sync',
  },
  {
    id: 'employees',
    title: 'Employee Management',
    subtitle: '201 Files & Digital Badges',
    icon: Users,
    color: 'from-indigo-500 to-purple-500 text-indigo-500',
    description: 'Complete 201 records, statutory ID tracking, and printable CR80 employee ID cards.',
    position: 'bottom-left',
    badge: 'CR80 Printable',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Targeted Push & Memos',
    icon: Bell,
    color: 'from-yellow-500 to-amber-500 text-amber-500',
    description: 'Broadcast corporate announcements, emergency weather alerts, and shift updates.',
    position: 'middle-left',
    badge: 'Targeted Channels',
  },
]

export function SystemArchitecture3D() {
  const [selectedModule, setSelectedModule] = useState<ArchitectureNode>(MODULES[0])

  return (
    <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Layers className="size-3.5" />
            <span>Integrated Platform Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-foreground">
            A Unified 3D Workforce Ecosystem
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every module operates as an interconnected node. Data generated from a single biometric punch seamlessly powers schedules, timesheets, statutory leave ledgers, and executive payroll.
          </p>
        </div>

        {/* 3D Interactive Ecosystem Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          {/* Left: Interactive Satellite Matrix */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {MODULES.map((mod) => {
              const Icon = mod.icon
              const isSelected = selectedModule.id === mod.id
              return (
                <motion.div
                  key={mod.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedModule(mod)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 text-white border-blue-500 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/30'
                      : 'bg-card/80 border-border/80 hover:border-primary/50 text-foreground'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${mod.color} text-white shadow-md`}>
                      <Icon className="size-4" />
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-bold ${
                      isSelected ? 'border-blue-400/40 text-cyan-300' : 'text-muted-foreground'
                    }`}>
                      {mod.badge}
                    </Badge>
                  </div>

                  <p className="text-xs font-bold leading-tight truncate">{mod.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{mod.subtitle}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Right: Selected Node Inspection Terminal */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedModule.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="glass-panel-3d rounded-3xl p-6 border border-white/20 dark:border-white/10 shadow-2xl space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${selectedModule.color} text-white shadow-lg`}>
                    <selectedModule.icon className="size-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider block">
                      Active Subsystem
                    </span>
                    <h3 className="text-xl font-black font-heading text-foreground">
                      {selectedModule.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedModule.description}
                </p>

                {/* Data stream sync note */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ENGINE STATUS:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">100% OPERATIONAL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LATENCY:</span>
                    <span className="font-bold text-foreground">&lt; 50ms Edge Sync</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SECURITY:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">RLS Protected</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
