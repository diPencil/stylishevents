interface CameraPerformanceCardProps {
  title: string
  waitTime: number
  queueLength: number
  uptime: number
}

export function CameraPerformanceCard({ title, waitTime, queueLength, uptime }: CameraPerformanceCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-card mb-4">
      <h3 className="font-medium mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <div className="text-sm text-muted-foreground">Avg. Wait:</div>
          <div className="font-medium">{waitTime} min</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Avg. Queue:</div>
          <div className="font-medium">{queueLength} people</div>
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-1">Uptime: {uptime}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${uptime}%` }}></div>
        </div>
      </div>
    </div>
  )
}
