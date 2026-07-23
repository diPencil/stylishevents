"use client"

import { ArrowUp, LineChart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InsightCardProps {
  icon: "up" | "chart" | "users"
  title: string
  description: string
  actionText: string
  onAction?: () => void
}

export function InsightCard({ icon, title, description, actionText, onAction }: InsightCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "up":
        return <ArrowUp className="h-5 w-5 text-green-500" />
      case "chart":
        return <LineChart className="h-5 w-5 text-blue-500" />
      case "users":
        return <Users className="h-5 w-5 text-amber-500" />
      default:
        return <ArrowUp className="h-5 w-5 text-green-500" />
    }
  }

  const getBgColor = () => {
    switch (icon) {
      case "up":
        return "bg-green-100"
      case "chart":
        return "bg-blue-100"
      case "users":
        return "bg-amber-100"
      default:
        return "bg-green-100"
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-card mb-4">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full ${getBgColor()} flex items-center justify-center flex-shrink-0`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="mt-2">
            <Button variant="link" className="p-0 h-auto text-primary" onClick={onAction}>
              {actionText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
