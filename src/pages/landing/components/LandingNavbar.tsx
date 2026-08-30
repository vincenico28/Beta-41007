import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, ShieldCheck, ArrowRight, Menu, X, Clock,
  Activity, Lock, Layers, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'

interface NavProps {
  activeSection?: string
}

export function LandingNavbar({ activeSection }: NavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Overview', href: '#hero' },
    { label: 'Capabilities', href: '#storytelling' },
    { label: 'AI Intelligence', href: '#ai-intelligence' },
    { label: 'Ecosystem', href: '#architecture' },
    { label: 'Feature Matrix', href: '#features' },
    { label: 'Security', href: '#security' },
  ]

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/60 py-3 shadow-md shadow-black/5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <div className="size-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden p-1">
              <img 
                src="/Favicon.wf.gif" 
                alt="Priority Handling Logo" 
                className="size-full object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-foreground whitespace-nowrap">
                Priority <span className="text-primary font-black">Handling</span>
              </span>
              <span className="hidden xs:inline-flex text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider border border-primary/20 whitespace-nowrap">
                Enterprise 3D
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide whitespace-nowrap">
              Logistics & Warehousing OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/50 backdrop-blur-md">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Action Hub */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DOLE & Biometrics Active</span>
          </div>

          <ModeToggle />

          <Link to="/login">
            <Button variant="ghost" size="sm" className="font-semibold text-xs">
              Sign In
            </Button>
          </Link>

          <Link to="/app/dashboard">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/25 gap-1.5 text-xs">
              Get Started <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-b border-border bg-background/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3"
        >
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Sign In to Enterprise
              </Button>
            </Link>
            <Link to="/app/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center gap-1.5 font-bold">
                Launch Interactive System <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
