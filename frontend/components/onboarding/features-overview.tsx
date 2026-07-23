"use client"

import { useState } from "react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, BarChart3, Video, Settings, Users } from "lucide-react"

export function FeaturesOverview() {
  const { setCurrentStep } = useOnboarding()
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      title: "Real-time Analytics",
      description:
        "Monitor queue lengths, foot traffic, and customer behavior in real-time to make immediate operational decisions.",
      icon: BarChart3,
      image: "/people-counting-dashboard.png",
    },
    {
      title: "Multiple Video Sources",
      description: "Connect to cloud storage, live CCTV/IP cameras, or upload video files directly for analysis.",
      icon: Video,
      image: "/connected-security-network.png",
    },
    {
      title: "Customizable Metrics",
      description:
        "Choose from a variety of metrics or create custom ones to track exactly what matters to your business.",
      icon: Settings,
      image: "/customizable-metrics-dashboard.png",
    },
    {
      title: "Actionable Insights",
      description:
        "Receive alerts and recommendations based on your data to optimize operations and improve customer experience.",
      icon: Users,
      image: "/business-insights-dashboard.png",
    },
  ]

  const nextFeature = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1)
    } else {
      setCurrentStep("template-selection")
    }
  }

  const prevFeature = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1)
    }
  }

  const feature = features[currentFeature]

  return (
    <motion.div
      key={currentFeature}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-3xl font-bold mb-4 text-center">Key Features</h2>
      <p className="text-muted-foreground mb-8 text-center">Discover what VideoMetrics.ai can do for your business</p>

      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
            <div className="bg-muted">
              <img
                src={feature.image || "/placeholder.svg"}
                alt={feature.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevFeature} disabled={currentFeature === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <div className="flex gap-1">
          {features.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentFeature ? "bg-primary" : "bg-gray-300"}`}
            />
          ))}
        </div>

        <Button onClick={nextFeature}>
          {currentFeature < features.length - 1 ? (
            <>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </div>
    </motion.div>
  )
}
