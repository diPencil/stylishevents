import { Clock, Users, BarChart3, Camera } from "lucide-react"

interface EventCardProps {
  type: "wait-time" | "queue-length" | "system-update" | "camera-issue"
  title: string
  description: string
  time: string
}

export function EventCard({ type, title, description, time }: EventCardProps) {
  const getIcon = () => {
    switch (type) {
      case "wait-time":
        return <Clock className="h-5 w-5 text-red-500" />
      case "queue-length":
        return <Users className="h-5 w-5 text-amber-500" />
      case "system-update":
        return <BarChart3 className="h-5 w-5 text-blue-500" />
      case "camera-issue":
        return <Camera className="h-5 w-5 text-amber-500" />
      default:
        return <Clock className="h-5 w-5 text-red-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "wait-time":
        return "bg-red-100"
      case "queue-length":
        return "bg-amber-100"
      case "system-update":
        return "bg-blue-100"
      case "camera-issue":
        return "bg-amber-100"
      default:
        return "bg-red-100"
    }
  }

  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-0">
      <div className={`w-10 h-10 rounded-full ${getBgColor()} flex items-center justify-center flex-shrink-0`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
