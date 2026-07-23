"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type OnboardingStep =
  | "welcome"
  | "features"
  | "template-selection"
  | "video-source"
  | "configure"
  | "review"
  | "completed"

interface OnboardingContextType {
  isFirstTimeUser: boolean
  currentStep: OnboardingStep
  setCurrentStep: (step: OnboardingStep) => void
  completeOnboarding: () => void
  skipOnboarding: () => void
  progress: number
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")

  // Calculate progress based on current step
  const stepOrder: OnboardingStep[] = [
    "welcome",
    "features",
    "template-selection",
    "video-source",
    "configure",
    "review",
    "completed",
  ]

  const progress = Math.round(((stepOrder.indexOf(currentStep) + 1) / (stepOrder.length - 1)) * 100)

  // Check if user is new on component mount
  useEffect(() => {
    const checkIfFirstTimeUser = () => {
      const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted")
      setIsFirstTimeUser(hasCompletedOnboarding !== "true")
    }

    checkIfFirstTimeUser()
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem("onboardingCompleted", "true")
    setIsFirstTimeUser(false)
    router.push("/dashboard")
  }

  const skipOnboarding = () => {
    localStorage.setItem("onboardingCompleted", "true")
    setIsFirstTimeUser(false)
    router.push("/dashboard")
  }

  return (
    <OnboardingContext.Provider
      value={{
        isFirstTimeUser,
        currentStep,
        setCurrentStep,
        completeOnboarding,
        skipOnboarding,
        progress,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
