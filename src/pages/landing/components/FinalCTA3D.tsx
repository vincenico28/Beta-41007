import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2,
  Zap, Clock, Award, Users, Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function FinalCTA3D() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dramatic ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-white/15 p-8 sm:p-14 text-center text-white shadow-2xl space-y-8 overflow-hidden"
        >
          {/* Subtle grid backdrop */}
          <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="size-3.5 text-cyan-400" />
            <span>Ready for Immediate Enterprise Deployment</span>
          </div>

          {/* Headline */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-tight">
              Build a Smarter Workforce Today.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join leading logistics and warehousing enterprises. Eliminate buddy punching, automate DOLE Form 48 timesheets, and unlock predictive AI rostering in minutes.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/login">
              <Button size="lg" className="h-13 px-9 text-base font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white shadow-xl shadow-blue-500/30 rounded-xl gap-2 transition-all">
                Get Started Free
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link to="/app/dashboard">
              <Button size="lg" variant="outline" className="h-13 px-8 text-base font-semibold border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md rounded-xl">
                Explore the Platform
              </Button>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              DOLE Form 48 Certified
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              Sub-Second Biometric AI
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              100m Spatial Geofence
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              Zero Credit Card Required
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
