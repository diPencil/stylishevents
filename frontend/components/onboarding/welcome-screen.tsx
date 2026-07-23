"use client"

import { useOnboarding } from "@/contexts/onboarding-context"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function WelcomeScreen() {
  const { setCurrentStep } = useOnboarding()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <h2 className="text-3xl font-bold mb-4">Welcome to VideoMetrics.ai</h2>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
        We're excited to help you gain valuable insights from your video data. Let's get you set up with a quick tour of
        the platform.
      </p>

      <div className="mb-8">
        <img
          src="/video-analytics-overview.png"
          alt="VideoMetrics.ai Dashboard Preview"
          className="rounded-lg mx-auto shadow-lg"
        />
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => setCurrentStep("template-selection")}>
          Skip Tour
        </Button>
        <Button onClick={() => setCurrentStep("features")}>Start Tour</Button>
      </div>
    </motion.div>
  )
}
