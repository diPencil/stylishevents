"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowLeft, Download } from "lucide-react"
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SnapshotSelector } from "@/components/snapshot-selector"

export default function QueueLengthAnalysisPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedZone, setSelectedZone] = useState("all")
  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(1)

  // Sample data for charts
  const queueLengthByDayData = [
    { day: "Mon", avg: 4.8, peak: 9.2, min: 1.5 },
    { day: "Tue", avg: 5.1, peak: 10.5, min: 1.8 },
    { day: "Wed", avg: 5.3, peak: 11.2, min: 2.0 },
    { day: "Thu", avg: 5.8, peak: 12.5, min: 2.2 },
    { day: "Fri", avg: 6.2, peak: 13.8, min: 2.5 },
    { day: "Sat", avg: 5.5, peak: 11.5, min: 2.1 },
    { day: "Sun", avg: 4.2, peak: 8.5, min: 1.4 },
  ]

  const queueLengthByHourData = [
    { hour: "08:00", checkout: 3.2, service: 2.5, entrance: 4.5 },
    { hour: "09:00", checkout: 3.8, service: 3.1, entrance: 5.2 },
    { hour: "10:00", checkout: 4.2, service: 3.5, entrance: 5.8 },
    { hour: "11:00", checkout: 4.8, service: 3.8, entrance: 6.2 },
    { hour: "12:00", checkout: 5.5, service: 4.2, entrance: 6.8 },
    { hour: "13:00", checkout: 5.3, service: 4.0, entrance: 6.5 },
    { hour: "14:00", checkout: 4.9, service: 3.7, entrance: 6.1 },
    { hour: "15:00", checkout: 4.5, service: 3.5, entrance: 5.8 },
    { hour: "16:00", checkout: 5.0, service: 3.9, entrance: 6.3 },
    { hour: "17:00", checkout: 5.4, service: 4.1, entrance: 6.7 },
    { hour: "18:00", checkout: 4.8, service: 3.8, entrance: 6.0 },
    { hour: "19:00", checkout: 4.2, service: 3.2, entrance: 5.5 },
    { hour: "20:00", checkout: 3.5, service: 2.8, entrance: 4.8 },
  ]

  const queueLengthDistributionData = [
    { range: "0-2 people", count: 150 },
    { range: "3-4 people", count: 280 },
    { range: "5-6 people", count: 420 },
    { range: "7-8 people", count: 350 },
    { range: "9-10 people", count: 220 },
    { range: "11-12 people", count: 120 },
    { range: "13+ people", count: 80 },
  ]

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

  // Sample snapshots data
  const snapshots = [
    {
      id: 1,
      title: "Morning Peak",
      timestamp: "Today 09:15",
      image: "/store-traffic-heatmap.png",
    },
    {
      id: 2,
      title: "Lunch Hour",
      timestamp: "Today 12:30",
      image: "/security-zones-overlay.png",
    },
    {
      id: 3,
      title: "Afternoon Lull",
      timestamp: "Today 14:45",
      image: "/security-camera-zones.png",
    },
    {
      id: 4,
      title: "Evening Rush",
      timestamp: "Today 17:30",
      image: "/people-count-timeline.png",
    },
  ]

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
                <h1 className="text-3xl font-bold">Queue Length Analysis</h1>
                <p className="text-muted-foreground">Detailed analysis of queue lengths across all zones</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
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

          <SnapshotSelector
            snapshots={snapshots}
            selectedSnapshot={selectedSnapshot}
            onSelectSnapshot={setSelectedSnapshot}
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Queue Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    5.3 <span className="text-base font-normal text-muted-foreground">people</span>
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    8% <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Peak Queue Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    13.8 <span className="text-base font-normal text-muted-foreground">people</span>
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    5% <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Minimum Queue Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    1.4 <span className="text-base font-normal text-muted-foreground">people</span>
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    12% <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Queue Threshold Breaches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    4 <span className="text-base font-normal text-muted-foreground">times</span>
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowDown className="h-4 w-4 mr-1" />2{" "}
                    <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Queue Length Trends</CardTitle>
                  <CardDescription>Average, peak, and minimum queue lengths over time</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Tabs defaultValue="day">
                    <TabsList>
                      <TabsTrigger value="day">Day</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      avg: {
                        label: "Average Queue Length",
                        color: "hsl(var(--chart-1))",
                      },
                      peak: {
                        label: "Peak Queue Length",
                        color: "hsl(var(--chart-2))",
                      },
                      min: {
                        label: "Minimum Queue Length",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={queueLengthByDayData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                      >
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
                        <Line
                          type="monotone"
                          dataKey="min"
                          stroke="var(--color-min)"
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Queue Length by Zone</CardTitle>
                <CardDescription>Comparison of queue lengths across different zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
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
                      <BarChart data={queueLengthByHourData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
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

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Queue Length Distribution</CardTitle>
                <CardDescription>Distribution of queue lengths across all zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Number of Occurrences",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={queueLengthDistributionData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Wait Time vs Queue Length</CardTitle>
                <CardDescription>Correlation between queue length and wait time by zone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
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
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
