"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, MoreVertical } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedProject, setSelectedProject] = useState("main-store")
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number>(1)

  // Sample snapshots data
  const snapshots = [
    {
      id: 1,
      title: "Morning Peak",
      timestamp: "Today 09:15",
      image: "/store-traffic-heatmap.png",
      waitTime: 3.8,
      queueLength: 5.3,
      serviceTime: 2.1,
      peakWaitTime: 8.2,
      waitTimeChange: -15,
      queueLengthChange: -8,
      serviceTimeChange: -5,
      peakWaitTimeChange: -20,
    },
    {
      id: 2,
      title: "Lunch Hour",
      timestamp: "Today 12:30",
      image: "/security-zones-overlay.png",
      waitTime: 4.5,
      queueLength: 6.2,
      serviceTime: 2.3,
      peakWaitTime: 10.2,
      waitTimeChange: -10,
      queueLengthChange: -5,
      serviceTimeChange: -3,
      peakWaitTimeChange: -15,
    },
    {
      id: 3,
      title: "Afternoon Lull",
      timestamp: "Today 14:45",
      image: "/security-camera-zones.png",
      waitTime: 2.5,
      queueLength: 3.1,
      serviceTime: 1.8,
      peakWaitTime: 5.2,
      waitTimeChange: -25,
      queueLengthChange: -15,
      serviceTimeChange: -10,
      peakWaitTimeChange: -30,
    },
    {
      id: 4,
      title: "Evening Rush",
      timestamp: "Today 17:30",
      image: "/people-count-timeline.png",
      waitTime: 4.2,
      queueLength: 5.8,
      serviceTime: 2.2,
      peakWaitTime: 9.5,
      waitTimeChange: -12,
      queueLengthChange: -7,
      serviceTimeChange: -4,
      peakWaitTimeChange: -18,
    },
  ]

  // Get the selected snapshot
  const selectedSnapshot = snapshots.find((snapshot) => snapshot.id === selectedSnapshotId) || snapshots[0]

  // Sample data for charts
  const waitTimeData = [
    { day: "Mon", avg: 3.2, peak: 7.8 },
    { day: "Tue", avg: 3.5, peak: 8.1 },
    { day: "Wed", avg: 3.8, peak: 8.2 },
    { day: "Thu", avg: 4.1, peak: 9.5 },
    { day: "Fri", avg: 4.5, peak: 10.2 },
    { day: "Sat", avg: 3.9, peak: 8.7 },
    { day: "Sun", avg: 2.8, peak: 6.4 },
  ]

  const queueLengthData = [
    { hour: "08:00", checkout: 2.1, service: 1.5, entrance: 3.2 },
    { hour: "09:00", checkout: 3.2, service: 2.1, entrance: 4.5 },
    { hour: "10:00", checkout: 3.8, service: 2.8, entrance: 5.2 },
    { hour: "11:00", checkout: 4.5, service: 3.2, entrance: 5.8 },
    { hour: "12:00", checkout: 5.2, service: 3.8, entrance: 6.1 },
    { hour: "13:00", checkout: 5.3, service: 3.5, entrance: 5.9 },
    { hour: "14:00", checkout: 4.7, service: 3.2, entrance: 5.5 },
    { hour: "15:00", checkout: 4.2, service: 2.8, entrance: 5.1 },
    { hour: "16:00", checkout: 4.8, service: 3.1, entrance: 5.7 },
    { hour: "17:00", checkout: 5.1, service: 3.7, entrance: 6.0 },
    { hour: "18:00", checkout: 4.5, service: 3.2, entrance: 5.5 },
    { hour: "19:00", checkout: 3.8, service: 2.5, entrance: 4.8 },
    { hour: "20:00", checkout: 2.5, service: 1.8, entrance: 3.5 },
  ]

  // Camera performance data
  const cameraPerformance = {
    frontEntrance: {
      waitTime: 4.2,
      queueLength: 6.1,
      uptime: 98.8,
    },
    checkoutArea: {
      waitTime: 3.5,
      queueLength: 4.7,
      uptime: 100,
    },
    customerService: {
      waitTime: 5.1,
      queueLength: 3.8,
      uptime: 98.5,
    },
  }

  // Insights data
  const insights = [
    {
      icon: "up",
      title: "Checkout Efficiency Improved",
      description: "Service time at checkout counters has decreased by 15% since last month.",
      action: "View Details",
    },
    {
      icon: "chart",
      title: "Peak Time Pattern Detected",
      description: "Consistent peak in queue lengths between 12:00-14:00 on weekdays.",
      action: "View Details",
    },
    {
      icon: "users",
      title: "Staffing Suggestion",
      description: "Adding one more cashier between 17:00-19:00 could reduce wait times by up to 30%.",
      action: "View Simulation",
    },
  ]

  // Recent events data
  const recentEvents = [
    {
      icon: "alert",
      title: "Wait Time Alert",
      description: "Wait time at Checkout Zone exceeded threshold (8 minutes)",
      time: "Today 14:32",
    },
    {
      icon: "warning",
      title: "Queue Length Warning",
      description: "Queue length at Customer Service reached 12 people",
      time: "Today 11:15",
    },
    {
      icon: "update",
      title: "System Update",
      description: "Analytics model updated to version 2.3.1",
      time: "Today 09:00",
    },
    {
      icon: "camera",
      title: "Camera Connection Issue",
      description: "Front Entrance camera connection unstable",
      time: "Yesterday 19:45",
    },
  ]

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Main Store Queue Management</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span>5 cameras</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span>Started: Mar 15, 2025</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Live</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main-store">Main Store Queue Management</SelectItem>
                <SelectItem value="warehouse">Warehouse Operations</SelectItem>
                <SelectItem value="parking">Parking Lot Monitoring</SelectItem>
              </SelectContent>
            </Select>

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

        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex space-x-6">
            <Link href="/analytics" className="border-b-2 border-primary px-1 py-2 text-sm font-medium">
              Overview
            </Link>
            <Link
              href="/analytics/wait-time"
              className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Wait Time
            </Link>
            <Link
              href="/analytics/queue-length"
              className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Queue Length
            </Link>
            <Link
              href="/analytics/service-time"
              className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Service Time
            </Link>
            <Link
              href="/analytics/peak-hours"
              className="border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Peak Hours
            </Link>
          </div>
        </div>

        {/* Video Snapshots Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Video Snapshots</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                onClick={() => setSelectedSnapshotId(snapshot.id)}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedSnapshotId === snapshot.id
                    ? "border-primary scale-[1.02] shadow-md"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={snapshot.image || "/placeholder.svg"}
                    alt={snapshot.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium">{snapshot.title}</h3>
                  <p className="text-xs text-muted-foreground">{snapshot.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                <span>Average Wait Time</span>
                <span className="text-red-500 text-xs">{selectedSnapshot.waitTimeChange}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {selectedSnapshot.waitTime} <span className="text-base font-normal text-muted-foreground">min</span>
              </div>
              <div className="text-xs text-muted-foreground">vs. 4.5 min last week</div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                <span>Avg Queue Length</span>
                <span className="text-red-500 text-xs">{selectedSnapshot.queueLengthChange}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {selectedSnapshot.queueLength}{" "}
                <span className="text-base font-normal text-muted-foreground">people</span>
              </div>
              <div className="text-xs text-muted-foreground">vs. 5.8 people last week</div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                <span>Service Time</span>
                <span className="text-red-500 text-xs">{selectedSnapshot.serviceTimeChange}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {selectedSnapshot.serviceTime} <span className="text-base font-normal text-muted-foreground">min</span>
              </div>
              <div className="text-xs text-muted-foreground">vs. 2.2 min last week</div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                <span>Peak Wait Time</span>
                <span className="text-red-500 text-xs">{selectedSnapshot.peakWaitTimeChange}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {selectedSnapshot.peakWaitTime} <span className="text-base font-normal text-muted-foreground">min</span>
              </div>
              <div className="text-xs text-muted-foreground">vs. 10.3 min last week</div>
            </CardContent>
          </Card>
        </div>

        {/* Wait Time Trends */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Wait Time Trends</CardTitle>
              <CardDescription>Average and peak wait times over the past week</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border">
                <Button variant="ghost" size="sm" className="rounded-r-none">
                  Day
                </Button>
                <Button variant="ghost" size="sm" className="rounded-none border-x">
                  Week
                </Button>
                <Button variant="ghost" size="sm" className="rounded-l-none">
                  Month
                </Button>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  avg: {
                    label: "Average Wait Time",
                    color: "hsl(var(--chart-1))",
                  },
                  peak: {
                    label: "Peak Wait Time",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={waitTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="var(--color-avg)"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peak"
                      stroke="var(--color-peak)"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Queue Length and Camera Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue Length by Hour */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Queue Length by Hour</CardTitle>
              <CardDescription>Average queue length across different zones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    checkout: {
                      label: "Checkout Area",
                      color: "hsl(var(--chart-1))",
                    },
                    service: {
                      label: "Customer Service",
                      color: "hsl(var(--chart-2))",
                    },
                    entrance: {
                      label: "Front Entrance",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={queueLengthData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="checkout" fill="var(--color-checkout)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="service" fill="var(--color-service)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="entrance" fill="var(--color-entrance)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Camera Performance */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Camera Performance</CardTitle>
              <CardDescription>Performance metrics for each camera zone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Front Entrance */}
              <div className="space-y-2">
                <div className="font-medium">Front Entrance</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Wait:</span>
                      <span>{cameraPerformance.frontEntrance.waitTime} min</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Queue:</span>
                      <span>{cameraPerformance.frontEntrance.queueLength} people</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime: {cameraPerformance.frontEntrance.uptime}%</span>
                  </div>
                  <Progress value={cameraPerformance.frontEntrance.uptime} className="h-2" />
                </div>
              </div>

              {/* Checkout Area */}
              <div className="space-y-2">
                <div className="font-medium">Checkout Area</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Wait:</span>
                      <span>{cameraPerformance.checkoutArea.waitTime} min</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Queue:</span>
                      <span>{cameraPerformance.checkoutArea.queueLength} people</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime: {cameraPerformance.checkoutArea.uptime}%</span>
                  </div>
                  <Progress value={cameraPerformance.checkoutArea.uptime} className="h-2" />
                </div>
              </div>

              {/* Customer Service */}
              <div className="space-y-2">
                <div className="font-medium">Customer Service</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Wait:</span>
                      <span>{cameraPerformance.customerService.waitTime} min</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Queue:</span>
                      <span>{cameraPerformance.customerService.queueLength} people</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime: {cameraPerformance.customerService.uptime}%</span>
                  </div>
                  <Progress value={cameraPerformance.customerService.uptime} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/*  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Insights</CardTitle>
              <CardDescription>AI-generated insights based on your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full ${
                        insight.icon === "up"
                          ? "bg-green-100"
                          : insight.icon === "chart"
                            ? "bg-blue-100"
                            : "bg-amber-100"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      {insight.icon === "up" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-500"
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                      )}
                      {insight.icon === "chart" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <line x1="12" y1="20" x2="12" y2="10" />
                          <line x1="18" y1="20" x2="18" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="16" />
                        </svg>
                      )}
                      {insight.icon === "users" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-amber-500"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      <div className="mt-2">
                        <Button variant="link" className="p-0 h-auto text-primary">
                          {insight.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest alerts and notifications from your analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border-b last:border-0">
                    <div
                      className={`w-10 h-10 rounded-full ${
                        event.icon === "alert"
                          ? "bg-red-100"
                          : event.icon === "warning"
                            ? "bg-amber-100"
                            : event.icon === "update"
                              ? "bg-blue-100"
                              : "bg-amber-100"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      {event.icon === "alert" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-500"
                        >
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      )}
                      {event.icon === "warning" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-amber-500"
                        >
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      )}
                      {event.icon === "update" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <path d="M21 2v6h-6" />
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                          <path d="M3 22v-6h6" />
                          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                      )}
                      {event.icon === "camera" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-amber-500"
                        >
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.title}</h3>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
