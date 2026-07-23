"use client"

import { useOnboarding } from "@/contexts/onboarding-context"
import { WelcomeScreen } from "./welcome-screen"
import { FeaturesOverview } from "./features-overview"
import { TemplateSelection } from "./template-selection"
import { VideoSourceSelection } from "./video-source-selection"
import { ConfigureAnalysis } from "./configure-analysis"
import { ReviewConfiguration } from "./review-configuration"
import { OnboardingCompleted } from "./onboarding-completed"
import { OnboardingProgress } from "./onboarding-progress"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function OnboardingController() {
  const { isFirstTimeUser, currentStep, skipOnboarding } = useOnboarding()

  // If not a first-time user, don't show onboarding
  if (!isFirstTimeUser) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full max-w-4xl h-auto min-h-[600px] max-h-[90vh] overflow-auto p-8 shadow-xl">
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={skipOnboarding}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>

        <OnboardingProgress />

        <div className="space-y-6">
          {currentStep === "welcome" && <WelcomeScreen />}
          {currentStep === "features" && <FeaturesOverview />}
          {currentStep === "template-selection" && <TemplateSelection />}
          {currentStep === "video-source" && <VideoSourceSelection />}
          {currentStep === "configure" && <ConfigureAnalysis />}
          {currentStep === "review" && <ReviewConfiguration />}
          {currentStep === "completed" && <OnboardingCompleted />}
        </div>
      </Card>
    </div>
  )
}
