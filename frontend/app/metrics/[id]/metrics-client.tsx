"use client"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, Clock, Download, LineChart, Share2, Users } from "lucide-react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export default function MetricsClient({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the analysis data based on the ID
  const analysisId = params.id

  // Sample data for the analysis
  const analysis = {
    id: analysisId,
    name: "Store Entrance Traffic Analysis",
    source: "Live Camera (RTSP)",
    status: "completed",
    createdAt: "2025-04-18T14:30:00",
    completedAt: "2025-04-18T16:45:00",
    duration: "2h 15m",
    metrics: {
      peopleCount: 1247,
      avgDwellTime: "2m 34s",
      peakHour: "14:00 - 15:00",
      conversionRate: "23%",
      malePercentage: 58,
      femalePercentage: 42,
    },
    hourlyData: [
      { hour: "09:00", count: 42, avgDwell: 145 },
      { hour: "10:00", count: 78, avgDwell: 132 },
      { hour: "11:00", count: 95, avgDwell: 156 },
      { hour: "12:00", count: 121, avgDwell: 178 },
      { hour: "13:00", count: 145, avgDwell: 189 },
      { hour: "14:00", count: 168, avgDwell: 201 },
      { hour: "15:00", count: 152, avgDwell: 187 },
      { hour: "16:00", count: 134, avgDwell: 165 },
      { hour: "17:00", count: 112, avgDwell: 143 },
      { hour: "18:00", count: 89, avgDwell: 124 },
      { hour: "19:00", count: 67, avgDwell: 112 },
      { hour: "20:00", count: 44, avgDwell: 98 },
    ],
    zoneData: [
      { zone: "Entrance", count: 1247, avgDwell: 154 },
      { zone: "Main Aisle", count: 876, avgDwell: 189 },
      { zone: "Electronics", count: 543, avgDwell: 267 },
      { zone: "Clothing", count: 621, avgDwell: 312 },
      { zone: "Checkout", count: 498, avgDwell: 423 },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{analysis.name}</h1>
                <p className="text-muted-foreground">
                  Analysis completed on {new Date(analysis.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-gradient border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total People</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{analysis.metrics.peopleCount}</div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Dwell Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{analysis.metrics.avgDwellTime}</div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Peak Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{analysis.metrics.peakHour}</div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{analysis.metrics.conversionRate}</div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Visualizations */}
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hourly">Hourly Analysis</TabsTrigger>
              <TabsTrigger value="zones">Zone Analysis</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Traffic Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[2/1] w-full bg-muted/30 rounded-md overflow-hidden">
                    <img
                      src="/people-count-timeline.png"
                      alt="Traffic Overview Chart"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Dwell Time Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square w-full bg-muted/30 rounded-md overflow-hidden">
                      <img
                        src="/dwell-time-histogram.png"
                        alt="Dwell Time Distribution"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Zone Heatmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square w-full bg-muted/30 rounded-md overflow-hidden">
                      <img src="/store-traffic-heatmap.png" alt="Zone Heatmap" className="w-full h-full object-cover" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hourly" className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Hourly Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[2/1] w-full bg-muted/30 rounded-md overflow-hidden">
                    <img
                      src="/placeholder.svg?height=400&width=800&query=bar chart showing hourly people count with trend line"
                      alt="Hourly Traffic Chart"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Hourly Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hour</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">People Count</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg. Dwell Time</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.hourlyData.map((hour) => (
                          <tr key={hour.hour} className="border-b hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 font-medium">{hour.hour}</td>
                            <td className="py-3 px-4">{hour.count}</td>
                            <td className="py-3 px-4">
                              {Math.floor(hour.avgDwell / 60)}m {hour.avgDwell % 60}s
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-24 h-8 bg-muted/30 rounded-md overflow-hidden">
                                {/* Mini sparkline chart would go here */}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zones" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Zone Traffic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square w-full bg-muted/30 rounded-md overflow-hidden">
                      <img
                        src="/placeholder.svg?height=400&width=400&query=pie chart showing traffic distribution by zone"
                        alt="Zone Traffic Distribution"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Zone Dwell Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square w-full bg-muted/30 rounded-md overflow-hidden">
                      <img
                        src="/placeholder.svg?height=400&width=400&query=bar chart showing average dwell time by zone"
                        alt="Zone Dwell Time"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Zone Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Zone</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">People Count</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg. Dwell Time</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.zoneData.map((zone) => (
                          <tr key={zone.zone} className="border-b hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 font-medium">{zone.zone}</td>
                            <td className="py-3 px-4">{zone.count}</td>
                            <td className="py-3 px-4">
                              {Math.floor(zone.avgDwell / 60)}m {zone.avgDwell % 60}s
                            </td>
                            <td className="py-3 px-4">
                              {Math.round((zone.count / analysis.metrics.peopleCount) * 100)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="demographics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Gender Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square w-full bg-muted/30 rounded-md overflow-hidden">
                      <img
                        src="/placeholder.svg?height=400&width=400&query=donut chart showing gender distribution"
                        alt="Gender Distribution"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Age Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square w-full bg-muted/30 rounded-md overflow-hidden">
                      <img
                        src="/placeholder.svg?height=400&width=400&query=bar chart showing age group distribution"
                        alt="Age Distribution"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Demographics by Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[2/1] w-full bg-muted/30 rounded-md overflow-hidden">
                    <img
                      src="/placeholder.svg?height=400&width=800&query=stacked area chart showing demographics by hour"
                      alt="Demographics by Hour"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Notable Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/30">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Unusual Crowd Detected</h3>
                          <p className="text-sm text-muted-foreground">Crowd size exceeded 150% of average at 14:35</p>
                          <div className="mt-2 text-xs text-muted-foreground">14:35 - Duration: 25 minutes</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-blue-500/10 border-blue-500/30">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Extended Dwell Time</h3>
                          <p className="text-sm text-muted-foreground">
                            Average dwell time in Electronics zone increased by 45%
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground">15:10 - Duration: 1 hour 15 minutes</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-green-500/10 border-green-500/30">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">High Conversion Rate</h3>
                          <p className="text-sm text-muted-foreground">
                            Conversion rate peaked at 32% between 16:00-17:00
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground">16:00 - Duration: 1 hour</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Event Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[2/1] w-full bg-muted/30 rounded-md overflow-hidden">
                    <img
                      src="/placeholder.svg?height=400&width=800&query=timeline chart showing events throughout the day"
                      alt="Event Timeline"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Video Playback with Overlay */}
          <Card className="border-0 shadow-md mb-8">
            <CardHeader>
              <CardTitle>Video Playback with Analytics Overlay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full bg-muted/30 rounded-md overflow-hidden relative">
                <img
                  src="/placeholder.svg?height=480&width=854&query=video frame with people detection boxes and tracking lines"
                  alt="Video Playback with Analytics"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/70 flex items-center px-4">
                  <div className="flex items-center gap-4 text-white">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-play"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </Button>
                    <div className="w-64 h-1 bg-white/30 rounded-full">
                      <div className="w-1/3 h-full bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs">01:24 / 04:12</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>AI-Generated Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                <h3 className="font-medium mb-2">Key Insights</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Peak traffic occurs between 14:00-15:00, with 168 visitors during this hour.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>
                      The Electronics zone has the highest dwell time (4m 27s), indicating strong customer interest.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Conversion rate peaks in the late afternoon (16:00-17:00) at 32%.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                <h3 className="font-medium mb-2">Recommendations</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Consider increasing staff during peak hours (14:00-15:00) to improve customer service.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>Leverage the high interest in Electronics by placing promotional items in this zone.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>
                      Implement targeted promotions during morning hours (9:00-11:00) to increase traffic during slower
                      periods.
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
