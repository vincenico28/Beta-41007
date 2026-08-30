import React from 'react'
import { motion } from 'framer-motion'
import {
  Layers, Database, Cpu, Lock, Globe, Zap,
  CheckCircle2, ArrowDown, Sparkles
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const TECH_LAYERS = [
  {
    layer: '01. Presentation & 3D Spatial UI',
    title: 'React 19 & TypeScript Frontend',
    desc: 'Ultra-responsive client layer powered by Tailwind CSS v4, Framer Motion, and hardware-accelerated Canvas WebGL shaders.',
    technologies: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion', 'Radix UI', 'Recharts'],
    icon: Globe,
    color: 'from-blue-600 to-cyan-500',
  },
  {
    layer: '02. API Gateway & Edge Telemetry',
    title: 'Supabase SSR & Real-time WebSockets',
    desc: 'High-speed sub-50ms Edge API workers dispatching live biometric logs, shift updates, and push notifications to all terminals.',
    technologies: ['Supabase SSR', 'Edge Functions', 'WebSockets', 'REST APIs', 'TanStack Query'],
    icon: Zap,
    color: 'from-indigo-600 to-blue-500',
  },
  {
    layer: '03. Intelligence & Generative AI',
    title: 'Google Gemini Neural Engine',
    desc: 'Autonomous AI processing shift gap analyses, fatigue risk forecasts, policy checks, and generative corporate communications.',
    technologies: ['Google Gemini API', 'Generative AI', 'Predictive Overtime Models', 'Roster Gap Auditor'],
    icon: Cpu,
    color: 'from-purple-600 to-indigo-500',
  },
  {
    layer: '04. Enterprise Database & RLS Security',
    title: 'PostgreSQL with Row Level Security',
    desc: 'Strict multi-tenant cryptographic isolation ensuring employee data is partitioned by department, role, and corporate security clearance.',
    technologies: ['PostgreSQL', 'Row Level Security (RLS)', 'Automated Migrations', 'Audit Logs'],
    icon: Database,
    color: 'from-emerald-600 to-teal-500',
  },
]

export function TechStack3D() {
  return (
    <section id="tech-stack" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider">
            <Cpu className="size-3.5" />
            <span>Enterprise Infrastructure</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-foreground">
            A Multi-Layered Enterprise Technology Stack
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Engineered from ground up with zero-compromise architectural standards: type-safe client, edge APIs, generative AI, and RLS-protected PostgreSQL.
          </p>
        </div>

        {/* Layered Stack Architecture Visualization */}
        <div className="max-w-4xl mx-auto space-y-4 pt-4">
          {TECH_LAYERS.map((layer, idx) => {
            const Icon = layer.icon
            return (
              <motion.div
                key={layer.layer}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="p-6 rounded-3xl bg-card/90 border border-border/80 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${layer.color} text-white shadow-lg shrink-0`}>
                      <Icon className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-bold text-primary uppercase tracking-wider">
                        {layer.layer}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black font-heading text-foreground">
                        {layer.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                        {layer.desc}
                      </p>
                    </div>
                  </div>

                  {/* Technology Badges */}
                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
                    {layer.technologies.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px] font-bold font-mono">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
