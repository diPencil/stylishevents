"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AnimatedCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function AnimatedCard({ icon, title, description, className }: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card
        className="overflow-hidden h-full transition-all duration-300 border-opacity-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <CardHeader>
            <motion.div
              className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              className="h-1 w-0 bg-gradient-to-r from-primary to-primary/50 rounded-full"
              animate={{ width: isHovered ? "100%" : "0%" }}
              transition={{ duration: 0.5 }}
            />
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}
