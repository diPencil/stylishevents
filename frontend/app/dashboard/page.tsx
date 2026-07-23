"use client"

import { useState, useEffect } from "react"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { OnboardingController } from "@/components/onboarding/onboarding-controller"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Users, Filter, Download } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTheme } from "next-themes"
import { DashboardLayout } from "../dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal } from "lucide-react"
import Image from "next/image"

export default function Dashboard() {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  const { theme } = useTheme()
  const [dateRange, setDateRange] = useState("7d")
  const [selectedProject, setSelectedProject] = useState("main-store")

  // Check if user is new on component mount
  useEffect(() => {
    const firstTimeUser = localStorage.getItem("isFirstTimeUser") === "true"
    setIsFirstTimeUser(firstTimeUser)

    // If this is a first-time user, mark them as having seen the dashboard
    // (but they'll still go through onboarding)
    if (firstTimeUser) {
      localStorage.setItem("hasSeenDashboard", "true")
    }
  }, [])

  // Queue length data for the line chart
  const queueLengthData = [
    { time: "08:00", value: 2 },
    { time: "09:00", value: 3 },
    { time: "10:00", value: 5 },
    { time: "11:00", value: 7 },
    { time: "12:00", value: 10 },
    { time: "13:00", value: 8 },
    { time: "14:00", value: 6 },
    { time: "15:00", value: 5 },
    { time: "16:00", value: 7 },
    { time: "17:00", value: 9 },
    { time: "18:00", value: 6 },
    { time: "19:00", value: 4 },
    { time: "20:00", value: 2 },
  ]

  // Foot traffic data for the bar chart
  const footTrafficData = [
    { hour: "08:00", entry: 45, exit: 12 },
    { hour: "09:00", entry: 78, exit: 34 },
    { hour: "10:00", entry: 95, exit: 67 },
    { hour: "11:00", entry: 102, exit: 87 },
    { hour: "12:00", entry: 120, exit: 100 },
    { hour: "13:00", entry: 90, exit: 110 },
    { hour: "14:00", entry: 86, exit: 89 },
    { hour: "15:00", entry: 75, exit: 72 },
    { hour: "16:00", entry: 92, exit: 85 },
    { hour: "17:00", entry: 115, exit: 98 },
    { hour: "18:00", entry: 88, exit: 105 },
    { hour: "19:00", entry: 50, exit: 70 },
    { hour: "20:00", entry: 25, exit: 45 },
  ]

  // Wait time vs queue length scatter data
  const waitTimeVsQueueLengthData = [
    { queueLength: 2, waitTime: 1.2, zone: "Checkout" },
    { queueLength: 3, waitTime: 1.8, zone: "Checkout" },
    { queueLength: 4, waitTime: 2.5, zone: "Checkout" },
    { queueLength: 5, waitTime: 3.2, zone: "Checkout" },
    { queueLength: 6, waitTime: 3.8, zone: "Checkout" },
    { queueLength: 7, waitTime: 4.5, zone: "Checkout" },
    { queueLength: 8, waitTime: 5.2, zone: "Checkout" },
    { queueLength: 9, waitTime: 5.8, zone: "Checkout" },
    { queueLength: 10, waitTime: 6.5, zone: "Checkout" },
    { queueLength: 2, waitTime: 1.5, zone: "Service" },
    { queueLength: 3, waitTime: 2.2, zone: "Service" },
    { queueLength: 4, waitTime: 3.0, zone: "Service" },
    { queueLength: 5, waitTime: 3.8, zone: "Service" },
    { queueLength: 6, waitTime: 4.5, zone: "Service" },
    { queueLength: 7, waitTime: 5.3, zone: "Service" },
    { queueLength: 8, waitTime: 6.0, zone: "Service" },
    { queueLength: 9, waitTime: 6.8, zone: "Service" },
    { queueLength: 10, waitTime: 7.5, zone: "Service" },
    { queueLength: 2, waitTime: 1.0, zone: "Entrance" },
    { queueLength: 3, waitTime: 1.5, zone: "Entrance" },
    { queueLength: 4, waitTime: 2.0, zone: "Entrance" },
    { queueLength: 5, waitTime: 2.5, zone: "Entrance" },
    { queueLength: 6, waitTime: 3.0, zone: "Entrance" },
    { queueLength: 7, waitTime: 3.5, zone: "Entrance" },
    { queueLength: 8, waitTime: 4.0, zone: "Entrance" },
    { queueLength: 9, waitTime: 4.5, zone: "Entrance" },
    { queueLength: 10, waitTime: 5.0, zone: "Entrance" },
  ]

  // Recent processed videos data
  const recentVideos = [
    {
      id: "v1",
      name: "Store A - Checkout 1",
      source: "AWS S3: checkout-cam-1/...",
      dateProcessed: "2025-04-05 15:30 IST",
      metrics: "Queue: 5, Wait: 2m 15s",
      status: "PROCESSED",
      action: "View Details",
    },
    {
      id: "v2",
      name: "Main Entrance Traffic",
      source: "CCTV: rtsp://...main",
      dateProcessed: "2025-04-05 14:05 IST",
      metrics: "In: 120, Out: 115",
      status: "PROCESSED",
      action: "View Details",
    },
    {
      id: "v3",
      name: "Gas Station Pump 3",
      source: "GCS: pump3-videos/...",
      dateProcessed: "2025-04-05 16:00 IST",
      metrics: "Vehicle Count: 8",
      status: "PROCESSING",
      action: "View Log",
    },
    {
      id: "v4",
      name: "Warehouse Zone B",
      source: "Upload: warehouse_b.mp4",
      dateProcessed: "2025-04-04 18:00 IST",
      metrics: "N/A",
      status: "FAILED",
      action: "View Error | Retry",
    },
    {
      id: "v5",
      name: "Lobby Waiting Area",
      source: "Azure Blob: lobby-cam/...",
      dateProcessed: "2025-04-04 16:10 IST",
      metrics: "-",
      status: "QUEUED",
      action: "-",
    },
  ]

  // Determine grid and chart colors based on theme
  const gridColor = theme === "black" ? "#333" : "#f0f0f0"
  const axisColor = theme === "black" ? "#555" : "#e0e0e0"

  return (
    <OnboardingProvider>
      <DashboardLayout>
        <div className="p-6 w-full max-w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
            <div className="flex items-center gap-4">
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
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">John Doe</div>
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  JD
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                  <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-accent-foreground"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +2 from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Connected Cameras</CardTitle>
                  <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-accent-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +5 from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Processing Time</CardTitle>
                  <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-accent-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">1.2s</div>
                  <div className="text-xs text-red-500 flex items-center">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    -0.3s from last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Analyzed Footage</CardTitle>
                  <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-accent-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">842h</div>
                  <div className="text-xs text-green-500 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +126h from last month
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 w-full">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Queue Length Over Time (Store A - Checkout 1)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ChartContainer
                  config={{
                    value: {
                      label: "Queue Length",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={queueLengthData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--color-value)"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-medium">Foot Traffic by Hour (Main Entrance)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ChartContainer
                  config={{
                    entry: {
                      label: "Entries",
                      color: "hsl(var(--chart-2))",
                    },
                    exit: {
                      label: "Exits",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={footTrafficData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Bar dataKey="entry" fill="var(--color-entry)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="exit" fill="var(--color-exit)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Scatter Chart for Wait Time vs Queue Length */}
          <Card className="border shadow-sm mb-6 w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Wait Time vs Queue Length by Zone</CardTitle>
                <p className="text-sm text-muted-foreground">Correlation between wait time and queue length</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  Checkout: {
                    label: "Checkout Area",
                    color: "hsl(var(--chart-1))",
                  },
                  Service: {
                    label: "Customer Service",
                    color: "hsl(var(--chart-2))",
                  },
                  Entrance: {
                    label: "Front Entrance",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      type="number"
                      dataKey="queueLength"
                      name="Queue Length"
                      unit=" people"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Queue Length (people)", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="waitTime"
                      name="Wait Time"
                      unit=" min"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Wait Time (min)", angle: -90, position: "insideLeft" }}
                    />
                    <ZAxis range={[60, 60]} />
                    <ChartTooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter
                      name="Checkout Area"
                      data={waitTimeVsQueueLengthData.filter((item) => item.zone === "Checkout")}
                      fill="var(--color-Checkout)"
                    />
                    <Scatter
                      name="Customer Service"
                      data={waitTimeVsQueueLengthData.filter((item) => item.zone === "Service")}
                      fill="var(--color-Service)"
                    />
                    <Scatter
                      name="Front Entrance"
                      data={waitTimeVsQueueLengthData.filter((item) => item.zone === "Entrance")}
                      fill="var(--color-Entrance)"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Queue Management Overview */}
          <Card className="border shadow-sm mb-6 w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Queue Management Overview</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  Day
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Week
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Month
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ChartContainer
                  config={{
                    waitTime: {
                      label: "Average Wait Time",
                      color: "hsl(var(--chart-1))",
                    },
                    queueLength: {
                      label: "Queue Length",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={queueLengthData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: axisColor }}
                        axisLine={{ stroke: axisColor }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Queue Length"
                        stroke="var(--color-queueLength)"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="mt-4 bg-muted/30 p-4 rounded-md">
                <h3 className="font-medium mb-2">Key Insights</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Peak wait times occur between 12:00-14:00 and 17:00-19:00</li>
                  <li>Average queue length increased by 12% on weekends</li>
                  <li>Wait times reduced by 15% after additional checkout opened</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts and Active Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 w-full">
            {/* Recent Alerts */}
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Recent Alerts</CardTitle>
                <Button variant="link" size="sm" className="text-primary">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border-l-4 border-red-500 pl-4 py-3 px-3 m-3 bg-red-50 dark:bg-red-900/10 rounded">
                  <div className="flex items-start">
                    <div className="mr-2 bg-red-100 dark:bg-red-900/30 rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium flex items-center">
                          <span>Wait Time Exceeded</span>
                          <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded">
                            High
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Today, 14:32</div>
                      </div>
                      <p className="text-sm">Wait time at Checkout Zone exceeded 8 minutes</p>
                      <div className="text-xs text-muted-foreground mt-1">Store #123</div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-amber-500 pl-4 py-3 px-3 m-3 bg-amber-50 dark:bg-amber-900/10 rounded">
                  <div className="flex items-start">
                    <div className="mr-2 bg-amber-100 dark:bg-amber-900/30 rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium flex items-center">
                          <span>Queue Length Warning</span>
                          <span className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded">
                            Medium
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Today, 11:15</div>
                      </div>
                      <p className="text-sm">Queue length at Customer Service reached 12 people</p>
                      <div className="text-xs text-muted-foreground mt-1">Store #123</div>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-4 py-3 px-3 m-3 bg-blue-50 dark:bg-blue-900/10 rounded">
                  <div className="flex items-start">
                    <div className="mr-2 bg-blue-100 dark:bg-blue-900/30 rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium flex items-center">
                          <span>Camera Connection Issue</span>
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded">
                            Low
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">Yesterday, 19:45</div>
                      </div>
                      <p className="text-sm">Front Entrance camera connection unstable</p>
                      <div className="text-xs text-muted-foreground mt-1">Store #123</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Active Projects</CardTitle>
                <Button variant="link" size="sm" className="text-primary">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-full">
                        <Users className="h-5 w-5 text-teal-500" />
                      </div>
                      <h3 className="font-medium">Main Store Queue Management</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    5 cameras
                    <span className="mx-2">•</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Started: Mar 15, 2025
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">Processing Status</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  <div className="text-right text-xs text-teal-500 mt-1">Live</div>
                </div>

                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-medium">Parking Lot Traffic Analysis</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    3 cameras
                    <span className="mx-2">•</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Started: Mar 20, 2025
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">Processing Status</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  <div className="text-right text-xs text-teal-500 mt-1">Live</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latest Video Feeds */}
          <Card className="border shadow-sm mb-6 w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Latest Video Feeds</CardTitle>
              <Button variant="link" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative rounded-lg overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    LIVE
                  </div>
                  <Image
                    src="/busy-storefront.png"
                    alt="Front Entrance Feed"
                    width={300}
                    height={200}
                    className="w-full h-[160px] object-cover"
                  />
                  <div className="p-2">
                    <h3 className="font-medium text-sm">Front Entrance</h3>
                    <p className="text-xs text-muted-foreground">Queue Management</p>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    LIVE
                  </div>
                  <Image
                    src="/busy-retail-checkout.png"
                    alt="Checkout Area Feed"
                    width={300}
                    height={200}
                    className="w-full h-[160px] object-cover"
                  />
                  <div className="p-2">
                    <h3 className="font-medium text-sm">Checkout Area</h3>
                    <p className="text-xs text-muted-foreground">Queue Management</p>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    LIVE
                  </div>
                  <Image
                    src="/busy-service-queue.png"
                    alt="Customer Service Feed"
                    width={300}
                    height={200}
                    className="w-full h-[160px] object-cover"
                  />
                  <div className="p-2">
                    <h3 className="font-medium text-sm">Customer Service</h3>
                    <p className="text-xs text-muted-foreground">Queue Management</p>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    LIVE
                  </div>
                  <Image
                    src="/crowded-parking.png"
                    alt="Parking Lot Feed"
                    width={300}
                    height={200}
                    className="w-full h-[160px] object-cover"
                  />
                  <div className="p-2">
                    <h3 className="font-medium text-sm">Parking Lot</h3>
                    <p className="text-xs text-muted-foreground">Traffic Analysis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Videos Table */}
          <Card className="border shadow-sm w-full">
            <CardHeader>
              <CardTitle className="text-base font-medium">Recent Processed Videos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                        Video/Project Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date Processed</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Key Metrics</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVideos.map((video) => (
                      <tr key={video.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{video.name}</td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{video.source}</td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{video.dateProcessed}</td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{video.metrics}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`
                              ${video.status === "PROCESSED" ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" : ""}
                              ${video.status === "PROCESSING" ? "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400" : ""}
                              ${video.status === "QUEUED" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400" : ""}
                              ${video.status === "FAILED" ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400" : ""}
                            `}
                          >
                            {video.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {video.action !== "-" ? (
                            <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                              {video.action}
                            </Button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Controller */}
        <OnboardingController />
      </DashboardLayout>
    </OnboardingProvider>
  )
}
