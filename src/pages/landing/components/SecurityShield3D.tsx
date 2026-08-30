import React from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Lock, KeyRound, EyeOff, FileCode2,
  Database, CheckCircle2, UserCheck, AlertTriangle, Sparkles
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const SECURITY_PILLARS = [
  {
    icon: Database,
    title: 'Row Level Security (RLS)',
    desc: 'Database queries execute with strict tenant isolation. Employees can only access their authorized records; supervisors cannot exceed department bounds.',
    tag: 'PostgreSQL RLS',
  },
  {
    icon: UserCheck,
    title: 'Biometric Anti-Photo Liveness',
    desc: 'AI computer vision analyzes facial micro-movements, depth geometry, and ambient reflections to block printed photos and digital replay attacks.',
    tag: 'Anti-Spoof Vision',
  },
  {
    icon: Lock,
    title: 'Anti-Spoofing GPS Verification',
    desc: 'Hardware telemetry measures travel acceleration, altitude bounds, and mock-location flags to guarantee physical facility presence.',
    tag: 'Hardware Geofence',
  },
  {
    icon: KeyRound,
    title: 'Granular Role Permissions (RBAC)',
    desc: 'Fine-grained permission matrices for Super Admins, HR Directors, Logistics Supervisors, and Employees with cryptographic session tokens.',
    tag: 'Enterprise RBAC',
  },
  {
    icon: EyeOff,
    title: 'End-to-End Encryption & TLS 1.3',
    desc: 'All data in transit is protected with TLS 1.3 encryption. Statutory IDs (SSS, PhilHealth, Pag-IBIG, TIN) are stored with field-level encryption.',
    tag: 'Field Encryption',
  },
  {
    icon: FileCode2,
    title: 'Immutable Audit Trail',
    desc: 'Every clock-in, schedule modification, leave approval, and appraisal submission is logged with cryptographic actor timestamps.',
    tag: 'Audit Logs',
  },
]

export function SecurityShield3D() {
  return (
    <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient security shield halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="size-3.5" />
            <span>Zero-Trust Enterprise Security</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-foreground">
            Security Built Into Every Layer
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Bank-grade cryptographic safeguards protecting employee biometrics, statutory government identities, spatial telemetry, and labor records.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {SECURITY_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl bg-card/80 border border-border/80 hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      {pillar.tag}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-black font-heading text-foreground">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="size-3.5" />
                  <span>Enforced by Default</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
