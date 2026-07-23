"use client"

import { motion } from "framer-motion"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full max-w-3xl mx-auto my-8 px-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="relative">
            <motion.div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index < currentStep
                  ? "bg-primary border-primary text-white"
                  : index === currentStep
                    ? "border-primary text-primary"
                    : "border-gray-300 text-gray-400"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {index + 1}
              {index < currentStep && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center justify-center h-full text-white">{index + 1}</div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-1 relative">
              <div
                className="absolute bg-gray-200"
                style={{
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: "2px",
                  transform: "translateY(-50%)",
                }}
              />
              <motion.div
                className="absolute bg-primary origin-left"
                style={{
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: "2px",
                  transform: "translateY(-50%)",
                  scaleX: index < currentStep ? 1 : 0,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: index < currentStep ? 1 : 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
