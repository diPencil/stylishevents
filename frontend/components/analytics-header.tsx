"use client"

import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalyticsHeaderProps {
  title: string
  description: string
  showBackButton?: boolean
  dateRange: string
  setDateRange: (value: string) => void
  selectedZone?: string
  setSelectedZone?: (value: string) => void
  showZoneFilter?: boolean
  selectedSnapshot?: string
  setSelectedSnapshot?: (value: string) => void
  snapshots?: Array<{ id: string; title: string }>
  showSnapshotFilter?: boolean
}

export function AnalyticsHeader({
  title,
  description,
  showBackButton = true,
  dateRange,
  setDateRange,
  selectedZone,
  setSelectedZone,
  showZoneFilter = true,
  selectedSnapshot,
  setSelectedSnapshot,
  snapshots = [],
  showSnapshotFilter = false,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Link href="/analytics">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {showSnapshotFilter && setSelectedSnapshot && selectedSnapshot && snapshots.length > 0 && (
          <Select value={selectedSnapshot} onValueChange={setSelectedSnapshot}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select snapshot" />
            </SelectTrigger>
            <SelectContent>
              {snapshots.map((snapshot) => (
                <SelectItem key={snapshot.id} value={snapshot.id}>
                  {snapshot.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showZoneFilter && setSelectedZone && selectedZone && (
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              <SelectItem value="checkout">Checkout Area</SelectItem>
              <SelectItem value="service">Customer Service</SelectItem>
              <SelectItem value="entrance">Front Entrance</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  )
}
