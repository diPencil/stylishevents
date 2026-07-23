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
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SnapshotSelector } from "@/components/snapshot-selector"

export default function WaitTimeAnalysisPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedZone, setSelectedZone] = useState("all")
  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(1)

  // Sample data for charts
  const waitTimeByDayData = [
    { day: "Mon", avg: 3.2, peak: 7.8, min: 1.2 },
    { day: "Tue", avg: 3.5, peak: 8.1, min: 1.4 },
    { day: "Wed", avg: 3.8, peak: 8.2, min: 1.5 },
    { day: "Thu", avg: 4.1, peak: 9.5, min: 1.6 },
    { day: "Fri", avg: 4.5, peak: 10.2, min: 1.8 },
    { day: "Sat", avg: 3.9, peak: 8.7, min: 1.5 },
    { day: "Sun", avg: 2.8, peak: 6.4, min: 1.1 },
  ]

  const waitTimeByHourData = [
    { hour: "08:00", checkout: 2.1, service: 3.5, entrance: 1.8 },
    { hour: "09:00", checkout: 2.8, service: 4.2, entrance: 2.5 },
    { hour: "10:00", checkout: 3.2, service: 4.8, entrance: 3.1 },
    { hour: "11:00", checkout: 3.8, service: 5.1, entrance: 3.5 },
    { hour: "12:00", checkout: 4.5, service: 5.5, entrance: 4.2 },
    { hour: "13:00", checkout: 4.2, service: 5.3, entrance: 4.0 },
    { hour: "14:00", checkout: 3.8, service: 5.0, entrance: 3.7 },
    { hour: "15:00", checkout: 3.5, service: 4.7, entrance: 3.4 },
    { hour: "16:00", checkout: 3.9, service: 5.1, entrance: 3.8 },
    { hour: "17:00", checkout: 4.2, service: 5.4, entrance: 4.1 },
    { hour: "18:00", checkout: 3.8, service: 5.0, entrance: 3.7 },
    { hour: "19:00", checkout: 3.2, service: 4.5, entrance: 3.1 },
    { hour: "20:00", checkout: 2.5, service: 3.8, entrance: 2.2 },
  ]

  const waitTimeDistributionData = [
    { range: "0-1 min", count: 120 },
    { range: "1-2 min", count: 250 },
    { range: "2-3 min", count: 380 },
    { range: "3-4 min", count: 420 },
    { range: "4-5 min", count: 280 },
    { range: "5-6 min", count: 190 },
    { range: "6-7 min", count: 120 },
    { range: "7-8 min", count: 80 },
    { range: "8-9 min", count: 50 },
    { range: "9+ min", count: 30 },
  ]

  const waitTimeComparisonData = [
    { week: "Week 1", current: 4.2, previous: 4.8 },
    { week: "Week 2", current: 4.0, previous: 4.6 },
    { week: "Week 3", current: 3.8, previous: 4.5 },
    { week: "Week 4", current: 3.5, previous: 4.3 },
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
                <h1 className="text-3xl font-bold">Wait Time Analysis</h1>
                <p className="text-muted-foreground">Detailed analysis of customer wait times</p>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Wait Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    3.8 <span className="text-base font-normal text-muted-foreground">min</span>
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    15% <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Peak Wait Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    8.2 <span className="text-base font-normal text-muted-foreground">min</span>
                  </div>
                  <div className="flex items-center text-green-500 text-sm font-medium">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    20% <span className="text-muted-foreground ml-1">vs last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Minimum Wait Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    1.2 <span className="text-base font-normal text-muted-foreground">min</span>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Wait Time Threshold Breaches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    3 <span className="text-base font-normal text-muted-foreground">times</span>
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
                  <CardTitle>Wait Time Trends</CardTitle>
                  <CardDescription>Average, peak, and minimum wait times over time</CardDescription>
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
                        label: "Average Wait Time",
                        color: "hsl(var(--chart-1))",
                      },
                      peak: {
                        label: "Peak Wait Time",
                        color: "hsl(var(--chart-2))",
                      },
                      min: {
                        label: "Minimum Wait Time",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={waitTimeByDayData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
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
                <CardTitle>Wait Time by Zone</CardTitle>
                <CardDescription>Comparison of wait times across different zones</CardDescription>
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
                      <AreaChart data={waitTimeByHourData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="checkout"
                          stackId="1"
                          stroke="var(--color-checkout)"
                          fill="var(--color-checkout)"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="service"
                          stackId="1"
                          stroke="var(--color-service)"
                          fill="var(--color-service)"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="entrance"
                          stackId="1"
                          stroke="var(--color-entrance)"
                          fill="var(--color-entrance)"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Wait Time Distribution</CardTitle>
                <CardDescription>Distribution of customer wait times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Number of Customers",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={waitTimeDistributionData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
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
                <CardTitle>Period Comparison</CardTitle>
                <CardDescription>Comparison of wait times with previous period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer
                    config={{
                      current: {
                        label: "Current Period",
                        color: "hsl(var(--chart-1))",
                      },
                      previous: {
                        label: "Previous Period",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={waitTimeComparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="current" fill="var(--color-current)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="previous" fill="var(--color-previous)" radius={[4, 4, 0, 0]} />
                      </BarChart>
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
