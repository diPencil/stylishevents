"use client"
import Image from "next/image"

export interface Snapshot {
  id: number
  title: string
  timestamp: string
  image: string
  data?: {
    waitTime: number
    queueLength: number
    serviceTime: number
    peakWaitTime: number
    cameras: {
      frontEntrance: {
        waitTime: number
        queueLength: number
        uptime: number
      }
      checkoutArea: {
        waitTime: number
        queueLength: number
        uptime: number
      }
      customerService: {
        waitTime: number
        queueLength: number
        uptime: number
      }
    }
    insights: Array<{
      type: "up" | "chart" | "users"
      title: string
      description: string
      actionText: string
    }>
    events: Array<{
      type: "wait-time" | "queue-length" | "system-update" | "camera-issue"
      title: string
      description: string
      time: string
    }>
  }
}

interface SnapshotSelectorProps {
  snapshots: Snapshot[]
  selectedSnapshotId?: number | null
  selectedSnapshot?: number | null
  onSelectSnapshot: (id: number) => void
}

export function SnapshotSelector({ snapshots, selectedSnapshot, selectedSnapshotId, onSelectSnapshot }: SnapshotSelectorProps) {
  const activeSnapshotId = selectedSnapshotId ?? selectedSnapshot ?? null
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Video Snapshots</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            onClick={() => onSelectSnapshot(snapshot.id)}
            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              activeSnapshotId === snapshot.id
                ? "border-primary scale-[1.02] shadow-md"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="relative h-40 w-full">
              <Image src={snapshot.image || "/placeholder.svg"} alt={snapshot.title} fill className="object-cover" />
            </div>
            <div className="p-3">
              <h3 className="font-medium">{snapshot.title}</h3>
              <p className="text-xs text-muted-foreground">{snapshot.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
