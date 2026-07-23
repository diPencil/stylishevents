"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let particles: Particle[] = []
    let animationFrameId: number

    const resizeCanvas = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const particleCount = Math.min(Math.floor((width * height) / 15000), 100)

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(${103 + Math.random() * 50}, ${58 + Math.random() * 50}, ${183 + Math.random() * 50}, ${0.3 + Math.random() * 0.4})`,
        })
      }
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height)

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around edges
        if (particle.x < 0) particle.x = width
        if (particle.x > width) particle.x = 0
        if (particle.y < 0) particle.y = height
        if (particle.y > height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()

        // Draw connections
        connectParticles(particle, index)
      })
    }

    const connectParticles = (particle: Particle, index: number) => {
      const connectionDistance = 150

      for (let i = index + 1; i < particles.length; i++) {
        const dx = particle.x - particles[i].x
        const dy = particle.y - particles[i].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const opacity = 1 - distance / connectionDistance
          ctx.beginPath()
          ctx.strokeStyle = `rgba(103, 58, 183, ${opacity * 0.2})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(particles[i].x, particles[i].y)
          ctx.stroke()
        }
      }
    }

    const animate = () => {
      drawParticles()
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-40" />
}
