"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 bg-primary/20 rounded-md blur-xl"
        animate={{
          scale: isHovered ? 1.1 : 0.8,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      <Button
        className={cn("relative overflow-hidden", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/30"
          animate={{
            x: isHovered ? "100%" : "-100%",
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.5 }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
    </div>
  )
}
