import React from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, ShieldCheck, Heart, MapPin, Scale,
  Building2, ArrowUpRight
} from 'lucide-react'

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-md pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Corporate Metadata */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <div className="size-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 shrink-0">
                <div className="size-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden p-1">
                  <img 
                    src="/Favicon.wf.gif" 
                    alt="Priority Handling Logo" 
                    className="size-full object-contain"
                  />
                </div>
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-foreground whitespace-nowrap">
                Priority <span className="text-primary font-black">Handling</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              The next-generation enterprise 3D Workforce Management OS engineered specifically for logistics hubs, supply chains, freight terminals, and distributed warehousing.
            </p>

            <div className="space-y-1 text-[11px] font-mono text-muted-foreground">
              <p>Deployment: Priority Handling Logistics, Inc.</p>
              <p>DOLE Reg. No: NCR-QC-2024-08 &bull; BIR TIN: 009-842-153-000</p>
              <p>Metro Manila, Philippines &bull; Pasay Logistics Terminal</p>
            </div>
          </div>

          {/* Core Modules Links */}
          <div className="space-y-3">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Platform Modules</p>
            <ul className="space-y-2">
              <li><Link to="/app/attendance" className="hover:text-primary transition-colors">Biometric Attendance</Link></li>
              <li><Link to="/app/attendance" className="hover:text-primary transition-colors">Spatial GPS Geofence</Link></li>
              <li><Link to="/app/schedules" className="hover:text-primary transition-colors">Smart Shift Roster</Link></li>
              <li><Link to="/app/timesheets" className="hover:text-primary transition-colors">DOLE Form 48 DTR</Link></li>
              <li><Link to="/app/leaves" className="hover:text-primary transition-colors">Statutory Leaves</Link></li>
              <li><Link to="/app/payroll" className="hover:text-primary transition-colors">Philippine Payroll</Link></li>
            </ul>
          </div>

          {/* Compliance & Labor Law */}
          <div className="space-y-3">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Philippine Compliance</p>
            <ul className="space-y-2">
              <li><span className="hover:text-foreground">DOLE Labor Code Art. 94</span></li>
              <li><span className="hover:text-foreground">RA 11210 (105-Day Maternity)</span></li>
              <li><span className="hover:text-foreground">RA 8187 (Paternity Leave)</span></li>
              <li><span className="hover:text-foreground">RA 9262 (VAWC Leave)</span></li>
              <li><span className="hover:text-foreground">DOLE Art. 95 Monetization</span></li>
              <li><span className="hover:text-foreground">Presidential Decree No. 851</span></li>
            </ul>
          </div>

          {/* Enterprise & Security */}
          <div className="space-y-3">
            <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">Security & System</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </li>
              <li><span className="hover:text-foreground">PostgreSQL Row Level Security</span></li>
              <li><span className="hover:text-foreground">Anti-Spoof GPS Engine</span></li>
              <li><span className="hover:text-foreground">Liveness Face Verification</span></li>
              <li><span className="hover:text-foreground">Immutable Audit Logs</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & certification strip */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; {currentYear} Priority Handling Logistics, Inc. &bull; Enterprise 3D OS. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-foreground">DOLE Certified</span>
            <span>&bull;</span>
            <span className="hover:text-foreground">TRAIN Law Ready</span>
            <span>&bull;</span>
            <span className="hover:text-foreground">ISO/IEC 27001 Prepared</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
