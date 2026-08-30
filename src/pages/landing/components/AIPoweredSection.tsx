import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Brain, Zap, CheckCircle2, AlertTriangle,
  TrendingUp, Calendar, ShieldCheck, FileText, ArrowRight,
  RefreshCw, Layers, Cpu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const AI_CAPABILITIES = [
  {
    id: 'roster-audit',
    title: 'Autonomous Roster & Shift Optimizer',
    tag: 'Roster Intelligence',
    desc: 'Analyzes flight cargo schedules and ground delivery peaks to auto-assign certified operators, preventing fatigue violations and mandatory 11-hour rest period breaches.',
    result: 'Zero shift gaps detected across 14-day logistics schedule. 24 shifts auto-balanced.',
    icon: Calendar,
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'ot-predictor',
    title: 'Predictive Overtime & Burnout Radar',
    tag: 'Labor Cost Control',
    desc: 'Simulates upcoming flight freight volumes to forecast potential overtime spikes 5 days ahead, recommending early shift rotations before premium 125% costs trigger.',
    result: 'Estimated ₱45,000 monthly overtime savings through proactive shift reallocation.',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'dole-audit',
    title: 'Philippine DOLE Policy Compliance Auditor',
    tag: 'Statutory Shield',
    desc: 'Continuously verifies all employee leaves against Republic Acts 11210 (Maternity), 8187 (Paternity), and Presidential Decree 851 (13th Month Pay calculations).',
    result: '100% compliance score verified. Zero statutory non-compliance exposure.',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'generative-memos',
    title: 'Generative Executive Memos & Circulars',
    tag: 'Internal Comms',
    desc: 'Drafts high-level bilingual corporate memoranda, holiday schedule notices, and appraisal summaries in standard DOLE-compliant corporate format with 1-click.',
    result: 'Official Corporate Communications Memo generated in 1.2 seconds.',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
  },
]

export function AIPoweredSection() {
  const [activeTab, setActiveTab] = useState(AI_CAPABILITIES[0].id)
  const activeCap = AI_CAPABILITIES.find((c) => c.id === activeTab) || AI_CAPABILITIES[0]

  return (
    <section id="ai-intelligence" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic ambient AI glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-purple-600/10 via-indigo-600/10 to-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold uppercase tracking-wider">
            <Brain className="size-3.5" />
            <span>Powered by Google Gemini AI</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-foreground">
            AI-Powered Workforce Intelligence
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Transform raw workforce data into actionable insights with intelligent automation and autonomous operational analytics.
          </p>
        </div>

        {/* 3D Interactive AI Core Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          {/* Left Column: 3D Animated AI Orb Core */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[440px]">
            {/* Concentric rotating orbital rings */}
            <div className="relative size-72 sm:size-80 flex items-center justify-center">
              {/* Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-purple-500/30 border-dashed"
              />

              {/* Middle Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
                className="absolute inset-6 rounded-full border border-indigo-400/40"
              />

              {/* Inner Glowing AI Neural Sphere */}
              <motion.div
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="size-36 sm:size-44 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-1 shadow-[0_0_60px_rgba(139,92,246,0.5)] flex items-center justify-center"
              >
                <div className="size-full rounded-full bg-slate-950/90 flex flex-col items-center justify-center text-center p-4 backdrop-blur-md border border-white/20">
                  <Sparkles className="size-8 text-cyan-400 animate-pulse mb-1" />
                  <span className="text-xs font-black font-heading tracking-wider text-white">GEMINI CORE</span>
                  <span className="text-[9px] font-mono text-cyan-300">ACTIVE NEURAL STREAM</span>
                </div>
              </motion.div>

              {/* Satellite Data Node 1 */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                className="absolute top-2 left-6 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg text-[10px] font-bold flex items-center gap-1.5"
              >
                <Calendar className="size-3 text-purple-400" />
                <span>Roster Balanced</span>
              </motion.div>

              {/* Satellite Data Node 2 */}
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
                className="absolute bottom-4 right-4 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg text-[10px] font-bold flex items-center gap-1.5"
              >
                <ShieldCheck className="size-3 text-emerald-400" />
                <span>100% DOLE Shield</span>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Interactive Capabilities Inspector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AI_CAPABILITIES.map((cap) => {
                const Icon = cap.icon
                const isActive = cap.id === activeTab
                return (
                  <button
                    key={cap.id}
                    onClick={() => setActiveTab(cap.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]'
                        : 'bg-card/70 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-4 mb-2" />
                    <p className="text-xs font-bold leading-tight line-clamp-1">{cap.tag}</p>
                  </button>
                )
              })}
            </div>

            {/* Active AI Diagnostic Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCap.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="glass-panel-3d rounded-3xl p-6 border border-white/20 dark:border-white/10 shadow-xl space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      {activeCap.tag} Module
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-heading text-foreground">
                      {activeCap.title}
                    </h3>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30 text-xs font-bold">
                    ACTIVE
                  </Badge>
                </div>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {activeCap.desc}
                </p>

                {/* AI Analysis Live Output Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-primary/10 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-purple-500" />
                    <span className="text-xs font-bold text-foreground">Gemini Live Output</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground font-mono">
                    "{activeCap.result}"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
