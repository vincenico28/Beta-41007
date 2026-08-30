import React, { useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { CanvasStarfield } from './components/CanvasStarfield'
import { LandingNavbar } from './components/LandingNavbar'
import { Hero3DCommandCenter } from './components/Hero3DCommandCenter'
import { ScrollStorytelling } from './components/ScrollStorytelling'
import { AIPoweredSection } from './components/AIPoweredSection'
import { SystemArchitecture3D } from './components/SystemArchitecture3D'
import { FeatureCards3D } from './components/FeatureCards3D'
import { SecurityShield3D } from './components/SecurityShield3D'
import { FinalCTA3D } from './components/FinalCTA3D'
import { LandingFooter } from './components/LandingFooter'

export default function LandingPage() {
  // Top scroll progress bar
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // SEO & Title Tag
  useEffect(() => {
    document.title = 'Priority Handling — Enterprise 3D Workforce Management OS | Logistics & Warehousing'
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden font-sans">
      {/* Scroll progress indicator at very top */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 z-50 origin-left"
      />

      {/* 3D Particle Starfield Canvas (60fps hardware accelerated) */}
      <CanvasStarfield />

      {/* Glassmorphism Enterprise Navigation */}
      <LandingNavbar />

      {/* Main 3D Experience Flow */}
      <main className="relative z-10 space-y-4 sm:space-y-8">
        {/* 1. Hero 3D Command Center */}
        <Hero3DCommandCenter />

        {/* 2. 6-Phase Interactive Problem & Solution Storytelling */}
        <ScrollStorytelling />

        {/* 3. AI-Powered Workforce Section */}
        <AIPoweredSection />

        {/* 4. Interactive 3D System Architecture & Ecosystem */}
        <SystemArchitecture3D />

        {/* 5. 10 Interactive 3D Feature Cards */}
        <FeatureCards3D />

        {/* 6. Zero-Trust Security Shield */}
        <SecurityShield3D />

        {/* 7. Final 3D Call-to-Action Finale */}
        <FinalCTA3D />
      </main>

      {/* Enterprise Footer */}
      <LandingFooter />
    </div>
  )
}
