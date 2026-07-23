"use client"

import { useOnboarding } from "@/contexts/onboarding-context"
import { Check, Video, Settings, FileText, FileCheck } from "lucide-react"

export function OnboardingProgress() {
  const { currentStep, progress } = useOnboarding()

  const steps = [
    { id: "welcome", label: "Welcome", icon: Check, active: ["welcome", "features"].includes(currentStep) },
    { id: "template", label: "Template", icon: FileText, active: currentStep === "template-selection" },
    { id: "source", label: "Video Source", icon: Video, active: currentStep === "video-source" },
    { id: "configure", label: "Configure", icon: Settings, active: currentStep === "configure" },
    { id: "review", label: "Review", icon: FileCheck, active: ["review", "completed"].includes(currentStep) },
  ]

  return (
    <div className="mb-10">
      <div className="relative flex items-center justify-between mb-8">
        {/* Center line container with precise positioning */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2">
          {/* Background line */}
          <div className="absolute inset-0 bg-gray-200 rounded-full"></div>

          {/* Progress line */}
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Step indicators */}
        {steps.map((step, index) => {
          // Calculate if this step is completed
          const isCompleted =
            index <
            steps.findIndex((s) =>
              ["welcome", "features"].includes(currentStep) ? s.id === "welcome" : s.id === currentStep,
            )

          // Determine the active state
          const isActive = step.active

          return (
            <div key={step.id} className="relative flex flex-col items-center z-10">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors ${
                  isActive
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isCompleted
                      ? "border-emerald-500 bg-white text-emerald-500"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                <step.icon className="h-6 w-6" />
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  isActive ? "text-emerald-600" : isCompleted ? "text-emerald-600" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
