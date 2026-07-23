"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function EnhancedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create gradient points
    const gradientPoints = [
      { x: canvas.width * 0.1, y: canvas.height * 0.1, radius: 300, color: "rgba(74, 222, 128, 0.15)" },
      { x: canvas.width * 0.8, y: canvas.height * 0.2, radius: 250, color: "rgba(59, 130, 246, 0.15)" },
      { x: canvas.width * 0.2, y: canvas.height * 0.8, radius: 350, color: "rgba(139, 92, 246, 0.15)" },
      { x: canvas.width * 0.7, y: canvas.height * 0.7, radius: 280, color: "rgba(236, 72, 153, 0.15)" },
    ]

    // Animation variables
    let animationFrameId: number
    const speeds = gradientPoints.map(() => ({
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
    }))

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update positions
      gradientPoints.forEach((point, index) => {
        point.x += speeds[index].x
        point.y += speeds[index].y

        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) {
          speeds[index].x *= -1
        }
        if (point.y < 0 || point.y > canvas.height) {
          speeds[index].y *= -1
        }

        // Draw gradient
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)
        gradient.addColorStop(0, point.color)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background/80 via-background/50 to-background/80" />

      {/* Animated shapes */}
      <motion.div
        className="fixed top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl -z-10"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="fixed bottom-20 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl -z-10"
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
    </>
  )
}
