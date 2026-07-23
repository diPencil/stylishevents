"use client"

import { useEffect } from "react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"

export function OnboardingCompleted() {
  const { completeOnboarding } = useOnboarding()

  // Trigger confetti effect when component mounts
  useEffect(() => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // Automatically redirect to dashboard after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      completeOnboarding()
    }, 5000)

    return () => clearTimeout(timer)
  }, [completeOnboarding])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="h-12 w-12 text-green-600" />
      </motion.div>

      <h2 className="text-3xl font-bold mb-4">Setup Complete!</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Your video analysis project has been created successfully. You'll be redirected to your dashboard in a moment.
      </p>

      <div className="space-y-4 max-w-md mx-auto mb-8">
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-medium mb-2">What's Next?</h3>
          <ul className="text-sm text-muted-foreground text-left space-y-2">
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <span>Your analysis will begin processing immediately</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <span>Initial results will appear on your dashboard as they become available</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-0.5">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <span>Explore additional features and set up alerts from your dashboard</span>
            </li>
          </ul>
        </div>
      </div>

      <Button onClick={completeOnboarding} className="gap-2">
        Go to Dashboard <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
