import React, { useEffect, useRef } from 'react'

export function CanvasStarfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle nodes for depth simulation
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75)
    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      size: number
      alpha: number
      color: string
    }> = []

    const colors = ['#3b82f6', '#6366f1', '#06b6d4', '#94a3b8']

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    let mouseX = width / 2
    let mouseY = height / 2

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    let isVisible = true
    const handleVisibility = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Draw subtle ambient radial glow centered near mouse/center
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 10, mouseX, mouseY, Math.max(width, height) * 0.6)
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)')
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.02)')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]

        p1.x += p1.vx * p1.z
        p1.y += p1.vy * p1.z

        if (p1.x < 0) p1.x = width
        if (p1.x > width) p1.x = 0
        if (p1.y < 0) p1.y = height
        if (p1.y > height) p1.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(p1.x, p1.y, p1.size * p1.z, 0, Math.PI * 2)
        ctx.fillStyle = p1.color
        ctx.globalAlpha = p1.alpha * 0.75
        ctx.fill()

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = '#3b82f6'
            ctx.globalAlpha = (1 - dist / 120) * 0.15
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1.0
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibility)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 dark:opacity-60"
      aria-hidden="true"
    />
  )
}
