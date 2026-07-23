"use client"

import { useState } from "react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Users,
  FuelIcon as GasPump,
  Utensils,
  Building,
  Tent,
  Factory,
  Clock,
  Settings,
} from "lucide-react"

export function TemplateSelection() {
  const { setCurrentStep } = useOnboarding()
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const templates = [
    {
      id: "retail-queue",
      title: "Retail Queue Analysis",
      description: "Monitor queue lengths and customer wait times at checkout counters or service desks.",
      icon: ShoppingCart,
    },
    {
      id: "foot-traffic",
      title: "Retail Foot Traffic",
      description: "Analyze customer flow, count entries/exits, and identify high-traffic zones within your store.",
      icon: Users,
    },
    {
      id: "gas-station",
      title: "Gas Station and Convenience Store",
      description: "Track vehicle presence at pumps, service times, and customer flow in the store.",
      icon: GasPump,
    },
    {
      id: "restaurant",
      title: "Restaurant Kitchen Efficiency",
      description: "Monitor order preparation times, staff movement, and station occupancy in commercial kitchens.",
      icon: Utensils,
    },
    {
      id: "trade-show",
      title: "Trade Show Analytics",
      description: "Analyze booth traffic, visitor engagement times, and crowd flow patterns.",
      icon: Building,
    },
    {
      id: "event",
      title: "Public Event Monitoring",
      description: "Monitor crowd density, manage entry/exit points, and enhance overall event safety.",
      icon: Tent,
    },
    {
      id: "manufacturing",
      title: "Manufacturing Efficiency",
      description: "Track production line flow, monitor safety compliance zones, and identify bottlenecks.",
      icon: Factory,
    },
    {
      id: "waiting-area",
      title: "Customer Waiting Area",
      description: "Measure average wait times and occupancy levels in waiting rooms or lobbies.",
      icon: Clock,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className="text-3xl font-bold mb-4 text-center">Select a Starting Template</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Let's get started by setting up your first video analysis project. Choose a template that best fits your use
        case, or start with a custom configuration.
      </p>

      <RadioGroup
        value={selectedTemplate}
        onValueChange={setSelectedTemplate}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
      >
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value={template.id} id={template.id} className="absolute right-4 top-4" />
            <div className="flex flex-col h-full">
              <div className="mb-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <template.icon className="h-5 w-5 text-primary" />
              </div>
              <Label htmlFor={template.id} className="text-lg font-medium cursor-pointer">
                {template.title}
              </Label>
              <p className="text-muted-foreground text-sm mt-2">{template.description}</p>
            </div>
          </div>
        ))}

        <div
          className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
            selectedTemplate === "custom" ? "border-primary bg-primary/5" : "hover:border-primary/50"
          }`}
        >
          <RadioGroupItem value="custom" id="custom" className="absolute right-4 top-4" />
          <div className="flex flex-col h-full">
            <div className="mb-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <Label htmlFor="custom" className="text-lg font-medium cursor-pointer">
              Custom Analysis
            </Label>
            <p className="text-muted-foreground text-sm mt-2">
              Start from scratch and define your own specific metrics and analysis parameters.
            </p>
          </div>
        </div>
      </RadioGroup>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("features")}>
          Back
        </Button>
        <Button onClick={() => setCurrentStep("video-source")} disabled={!selectedTemplate}>
          Next: Select Video Source
        </Button>
      </div>
    </motion.div>
  )
}
