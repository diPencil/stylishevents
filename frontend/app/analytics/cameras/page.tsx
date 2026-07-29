"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Camera, Check, Download, ExternalLink, LineChart, Settings, X } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function CameraPerformancePage() {
  const [dateRange, setDateRange] = useState("7d")

  // Sample data for camera performance
  const cameras = [
    {
      id: "cam-1",
      name: "Front Entrance",
      location: "Main Entrance",
      status: "online",
      uptime: 99.8,
      avgWait: 4.2,
      avgQueue: 6.1,
      lastIssue: "2025-04-22 19:45",
      issueDesc: "Connection unstable",
    },
    {
      id: "cam-2",
      name: "Checkout Area",
      location: "Checkout Zone",
      status: "online",
      uptime: 100,
      avgWait: 3.5,
      avgQueue: 4.7,
      lastIssue: "2025-04-15 08:12",
      issueDesc: "Calibration required",
    },
    {
      id: "cam-3",
      name: "Customer Service",
      location: "Service Desk",
      status: "online",
      uptime: 98.5,
      avgWait: 5.1,
      avgQueue: 3.8,
      lastIssue: "2025-04-23 14:30",
      issueDesc: "Brief power outage",
    },
    {
      id: "cam-4",
      name: "Electronics Department",
      location: "Electronics Section",
      status: "offline",
      uptime: 85.2,
      avgWait: 3.8,
      avgQueue: 2.5,
      lastIssue: "2025-04-24 09:15",
      issueDesc: "Network connectivity issue",
    },
    {
      id: "cam-5",
      name: "Warehouse Entrance",
      location: "Warehouse",
      status: "online",
      uptime: 99.5,
      avgWait: 2.2,
      avgQueue: 1.8,
      lastIssue: "2025-04-18 11:20",
      issueDesc: "Scheduled maintenance",
    },
  ]

  const uptimeData = [
    {
      date: "04/18",
      "Front Entrance": 100,
      "Checkout Area": 100,
      "Customer Service": 99.5,
      Electronics: 98.2,
      Warehouse: 100,
    },
    {
      date: "04/19",
      "Front Entrance": 100,
      "Checkout Area": 100,
      "Customer Service": 100,
      Electronics: 97.8,
      Warehouse: 100,
    },
    {
      date: "04/20",
      "Front Entrance": 100,
      "Checkout Area": 100,
      "Customer Service": 100,
      Electronics: 95.5,
      Warehouse: 99.8,
    },
    {
      date: "04/21",
      "Front Entrance": 99.8,
      "Checkout Area": 100,
      "Customer Service": 100,
      Electronics: 92.3,
      Warehouse: 100,
    },
    {
      date: "04/22",
      "Front Entrance": 99.2,
      "Checkout Area": 100,
      "Customer Service": 100,
      Electronics: 90.1,
      Warehouse: 100,
    },
    {
      date: "04/23",
      "Front Entrance": 100,
      "Checkout Area": 100,
      "Customer Service": 98.5,
      Electronics: 88.7,
      Warehouse: 100,
    },
    {
      date: "04/24",
      "Front Entrance": 100,
      "Checkout Area": 100,
      "Customer Service": 100,
      Electronics: 0,
      Warehouse: 100,
    },
  ]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "offline":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "maintenance":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-2">
              <Link href="/analytics">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Camera Performance</h1>
                <p className="text-muted-foreground">Monitor and analyze camera performance metrics</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
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

          {/* Camera Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cameras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{cameras.length}</div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Online Cameras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{cameras.filter((c) => c.status === "online").length}</div>
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Offline Cameras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{cameras.filter((c) => c.status === "offline").length}</div>
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {(cameras.reduce((acc, cam) => acc + cam.uptime, 0) / cameras.length).toFixed(1)}%
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Camera Uptime Chart */}
          <Card className="border shadow-sm mb-8">
            <CardHeader>
              <CardTitle>Camera Uptime Trends</CardTitle>
              <CardDescription>7-day uptime percentage for all cameras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    "Front Entrance": {
                      label: "Front Entrance",
                      color: "hsl(var(--chart-1))",
                    },
                    "Checkout Area": {
                      label: "Checkout Area",
                      color: "hsl(var(--chart-2))",
                    },
                    "Customer Service": {
                      label: "Customer Service",
                      color: "hsl(var(--chart-3))",
                    },
                    Electronics: {
                      label: "Electronics",
                      color: "hsl(var(--chart-4))",
                    },
                    Warehouse: {
                      label: "Warehouse",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={uptimeData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Front Entrance"
                        stroke="var(--color-Front Entrance)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Checkout Area"
                        stroke="var(--color-Checkout Area)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Customer Service"
                        stroke="var(--color-Customer Service)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Electronics"
                        stroke="var(--color-Electronics)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Warehouse"
                        stroke="var(--color-Warehouse)"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Camera Details */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Camera Details</CardTitle>
              <CardDescription>Performance metrics for individual cameras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cameras.map((camera) => (
                  <div key={camera.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{camera.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(camera.status)}`}>
                            {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{camera.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Feed
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                          <Settings className="h-3.5 w-3.5 mr-1" /> Configure
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Uptime</div>
                        <div className="flex items-center gap-2">
                          <Progress value={camera.uptime} className="h-2" />
                          <span className="text-sm font-medium">{camera.uptime}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Avg. Wait Time</div>
                        <div className="text-sm font-medium">{camera.avgWait} min</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Avg. Queue Length</div>
                        <div className="text-sm font-medium">{camera.avgQueue} people</div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Last Issue: </span>
                      <span>
                        {camera.lastIssue} - {camera.issueDesc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
