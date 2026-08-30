import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import {
  Users, Clock, Calendar, ShieldCheck, MapPin, Sparkles,
  ArrowRight, CheckCircle2, QrCode, TrendingUp, Award,
  Activity, Star, UserCheck, Play, ChevronDown, Compass,
  Layers, Lock, Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero3DCommandCenter() {
  const containerRef = useRef<HTMLDivElement>(null)

  // 3D Tilt based on mouse position
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 120 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const xPct = (e.clientX - rect.left) / width - 0.5
    const yPct = (e.clientY - rect.top) / height - 0.5
    mouseX.set(xPct)
    mouseY.set(yPct)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section 
      id="hero"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background ambient lighting halos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        {/* Left Column: Value Proposition & CTAs */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-6 text-left"
        >
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 dark:bg-slate-900/90 text-slate-100 border border-slate-700/60 shadow-lg backdrop-blur-md">
            <span className="flex size-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="size-3.5 text-cyan-400" />
            <span className="text-xs font-bold tracking-wide">Enterprise Logistics & Warehousing OS</span>
          </div>

          {/* Core Headline */}
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black font-heading tracking-tight text-foreground leading-[1.08]">
            Smart Workforce Management.{' '}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 bg-clip-text text-transparent block mt-1">
              Built for Modern Operations.
            </span>
          </h1>

          {/* Supporting Pitch */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
            A unified platform engineered for high-throughput logistics, supply chains, and distributed facilities. Orchestrate real-time biometric attendance, smart schedules, automated timesheets, DOLE statutory leaves, and predictive workforce analytics in one spatial interface.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/app/dashboard">
              <Button size="lg" className="h-13 px-8 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 rounded-xl gap-2 group transition-all">
                Explore the System
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <a href="#storytelling">
              <Button size="lg" variant="outline" className="h-13 px-7 text-base font-semibold border-border/80 hover:bg-muted/60 backdrop-blur-md rounded-xl gap-2">
                <Play className="size-4 text-primary fill-primary/20" />
                View Features
              </Button>
            </a>
          </div>

          {/* Enterprise Metric Counters */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 max-w-lg">
            <div>
              <p className="text-2xl font-black font-heading text-foreground">50K+</p>
              <p className="text-xs text-muted-foreground font-medium">Daily Timecards Logged</p>
            </div>
            <div>
              <p className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">100%</p>
              <p className="text-xs text-muted-foreground font-medium">DOLE Form 48 Compliant</p>
            </div>
            <div>
              <p className="text-2xl font-black font-heading text-blue-600 dark:text-blue-400">0.28s</p>
              <p className="text-xs text-muted-foreground font-medium">Biometric Face Auth</p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Interactive Workforce Command Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="lg:col-span-6 relative perspective-1200 flex items-center justify-center min-h-[480px] sm:min-h-[540px]"
        >
          {/* Main 3D Floating Canvas Dashboard */}
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="w-full max-w-[540px] glass-panel-3d rounded-3xl p-5 sm:p-6 border border-white/20 dark:border-white/10 shadow-2xl relative select-none"
          >
            {/* Top Command Center Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/50 translate-z-20">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h2 className="text-sm font-bold font-heading text-foreground">Priority Handling Logistics, Inc.</h2>
                  <p className="text-[10px] text-muted-foreground font-mono">Hub 04 &bull; Pasay Logistics Terminal &bull; Metro Manila</p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                LIVE HUB ACTIVE
              </Badge>
            </div>

            {/* Spatial Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-4">
              {/* Biometric & Face Verification HUD (Left Sub-card) */}
              <div className="sm:col-span-7 bg-slate-900/90 text-white rounded-2xl p-4 border border-slate-700/60 shadow-lg space-y-3 translate-z-30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Biometric Face Kiosk</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">99.8% MATCH</span>
                </div>

                {/* Face Scanning Viewfinder Simulation */}
                <div className="relative h-28 bg-slate-950/80 rounded-xl overflow-hidden border border-cyan-500/30 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
                  
                  {/* Laser Scan line */}
                  <motion.div
                    animate={{ y: [-40, 40, -40] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                  />

                  {/* Target Crosshairs */}
                  <div className="relative size-16 border-2 border-dashed border-cyan-400/80 rounded-xl flex items-center justify-center">
                    <div className="size-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400">
                      <span className="text-xs font-black text-cyan-300">MS</span>
                    </div>
                  </div>

                  {/* Recognition Metadata */}
                  <div className="absolute bottom-1.5 left-2 right-2 flex justify-between text-[9px] font-mono text-cyan-300/80">
                    <span>ID: EMP-2026-088</span>
                    <span>GEO: 14.5378° N, 120.9992° E</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <p className="font-bold text-white leading-tight">Marc Santos</p>
                    <p className="text-[10px] text-slate-400">Logistics Shift Supervisor</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] font-bold">
                    VERIFIED ON-TIME
                  </Badge>
                </div>
              </div>

              {/* Spatial GPS Radar Geofence Card (Right Sub-card) */}
              <div className="sm:col-span-5 bg-background/80 backdrop-blur-md rounded-2xl p-4 border border-border/80 shadow-md space-y-3 translate-z-40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">GPS Radar</span>
                  </div>
                  <span className="text-[10px] text-primary font-mono font-bold">100m Bound</span>
                </div>

                {/* Radar Circle */}
                <div className="relative size-24 mx-auto rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-2 rounded-full border border-dashed border-primary/30" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent"
                  />
                  {/* Worker location pulse */}
                  <div className="relative size-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]">
                    <span className="absolute -inset-1 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  </div>
                </div>

                <div className="text-center text-[10px] text-muted-foreground font-mono">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Inside Office Zone</span> &bull; 0m Offset
                </div>
              </div>

              {/* Live Shift & DOLE Compliance Strip */}
              <div className="sm:col-span-12 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-primary/10 rounded-2xl p-3.5 border border-primary/20 flex items-center justify-between text-xs translate-z-30">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Shift: Morning Logistics Ground (08:00 - 17:00)</p>
                    <p className="text-[11px] text-muted-foreground">Civil Service Form 48 DTR &bull; Automatic 125% Overtime Engine</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-extrabold uppercase text-emerald-600 border-emerald-300 dark:text-emerald-400">
                  AUTO-SYNCED
                </Badge>
              </div>
            </div>

            {/* Floating Satellite 3D Badges */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-2 text-xs font-bold translate-z-50"
            >
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>DOLE Art. 94 Certified</span>
            </motion.div>

            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-2 text-xs font-bold translate-z-50"
            >
              <Sparkles className="size-4 text-amber-400" />
              <span>Gemini AI Roster Engine</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Scroll to Explore</span>
        <ChevronDown className="size-4 text-primary animate-bounce" />
      </div>
    </section>
  )
}
