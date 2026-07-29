"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowDown, ArrowUp } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DashboardLayout } from "../../dashboard-layout"
import { AnalyticsHeader } from "@/components/analytics-header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SnapshotSelector } from "@/components/snapshot-selector"

export default function ServiceTimeAnalysisPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [selectedZone, setSelectedZone] = useState("all")
  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(1)

  // Sample data for charts
  const serviceTimeByDayData = [
    { day: "Mon", avg: 1.8, peak: 3.2, min: 0.8 },
    { day: "Tue", avg: 2.0, peak: 3.5, min: 0.9 },
    { day: "Wed", avg: 2.1, peak: 3.8, min: 1.0 },
    { day: "Thu", avg: 2.2, peak: 4.0, min: 1.0 },
    { day: "Fri", avg: 2.3, peak: 4.2, min: 1.1 },
    { day: "Sat", avg: 2.0, peak: 3.6, min: 0.9 },
    { day: "Sun", avg: 1.7, peak: 3.0, min: 0.8 },
  ]

  const serviceTimeByHourData = [
    { hour: "08:00", checkout: 1.5, service: 2.8, entrance: 1.2 },
    { hour: "09:00", checkout: 1.6, service: 3.0, entrance: 1.3 },
    { hour: "10:00", checkout: 1.8, service: 3.2, entrance: 1.4 },
    { hour: "11:00", checkout: 2.0, service: 3.5, entrance: 1.5 },
    { hour: "12:00", checkout: 2.2, service: 3.8, entrance: 1.7 },
    { hour: "13:00", checkout: 2.1, service: 3.7, entrance: 1.6 },
    { hour: "14:00", checkout: 2.0, service: 3.5, entrance: 1.5 },
    { hour: "15:00", checkout: 1.9, service: 3.4, entrance: 1.4 },
    { hour: "16:00", checkout: 2.1, service: 3.6, entrance: 1.6 },
    { hour: "17:00", checkout: 2.3, service: 3.9, entrance: 1.8 },
    { hour: "18:00", checkout: 2.1, service: 3.7, entrance: 1.6 },
    { hour: "19:00", checkout: 1.9, service: 3.3, entrance: 1.4 },
    { hour: "20:00", checkout: 1.7, service: 3.0, entrance: 1.3 },
  ]

  const serviceTimeDistributionData = [
    { range: "0-1 min", count: 180 },
    { range: "1-2 min", count: 350 },
    { range: "2-3 min", count: 420 },
    { range: "3-4 min", count: 280 },
    { range: "4-5 min", count: 150 },
    { range: "5+ min", count: 70 },
  ]

  const serviceTypeData = [
    { name: "Standard Checkout", value: 65 },
    { name: "Express Checkout", value: 20 },
    { name: "Self-Service", value: 15 },
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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  return (
    <DashboardLayout>
      <div className="p-6">
        <AnalyticsHeader
          title="Service Time Analysis"
          description="Detailed analysis of customer service times"
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
        />

        <SnapshotSelector
          snapshots={snapshots}
          selectedSnapshot={selectedSnapshot}
          onSelectSnapshot={setSelectedSnapshot}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Service Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  2.1 <span className="text-base font-normal text-muted-foreground">min</span>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Peak Service Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  4.2 <span className="text-base font-normal text-muted-foreground">min</span>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Minimum Service Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  0.8 <span className="text-base font-normal text-muted-foreground">min</span>
                </div>
                <div className="flex items-center text-green-500 text-sm font-medium">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  10% <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Service Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  92% <span className="text-base font-normal text-muted-foreground"></span>
                </div>
                <div className="flex items-center text-green-500 text-sm font-medium">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  3% <span className="text-muted-foreground ml-1">vs last period</span>
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
                <CardTitle>Service Time Trends</CardTitle>
                <CardDescription>Average, peak, and minimum service times over time</CardDescription>
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
                      label: "Average Service Time",
                      color: "hsl(var(--chart-1))",
                    },
                    peak: {
                      label: "Peak Service Time",
                      color: "hsl(var(--chart-2))",
                    },
                    min: {
                      label: "Minimum Service Time",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={serviceTimeByDayData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
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
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Service Time by Zone</CardTitle>
              <CardDescription>Comparison of service times across different zones</CardDescription>
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
                    <BarChart data={serviceTimeByHourData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
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
              <CardTitle>Service Time Distribution</CardTitle>
              <CardDescription>Distribution of service times</CardDescription>
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
                    <BarChart data={serviceTimeDistributionData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Service Type Distribution</CardTitle>
              <CardDescription>Distribution of service types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {serviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Service Time Insights</CardTitle>
              <CardDescription>Key insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-card">
                  <h3 className="font-medium mb-2">Peak Service Time Reduction</h3>
                  <p className="text-sm text-muted-foreground">
                    Service times peak between 12:00-13:00 and 17:00-18:00. Consider adding additional staff during
                    these hours to reduce service times.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <h3 className="font-medium mb-2">Express Checkout Efficiency</h3>
                  <p className="text-sm text-muted-foreground">
                    Express checkout lanes are 35% more efficient than standard lanes. Consider converting one more
                    standard lane to express during peak hours.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <h3 className="font-medium mb-2">Self-Service Adoption</h3>
                  <p className="text-sm text-muted-foreground">
                    Self-service usage has increased by 12% since last month. Continue promoting self-service options to
                    reduce overall service times.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
