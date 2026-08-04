"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EnhancedBackground } from "@/components/enhanced-background"
import { BookOpen, Code, FileText, Layers, LifeBuoy, Search, Settings, Video, Zap } from "lucide-react"

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <EnhancedBackground />

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Documentation & <span className="text-gradient">Resources</span>
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Everything you need to get started and make the most of VideoMetrics.ai.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="max-w-lg mx-auto"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search documentation..."
                    className="pl-10 h-12 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Documentation Categories */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Browse Documentation</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find the information you need to get started and make the most of VideoMetrics.ai.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="card-hover card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Getting Started</h3>
                  <p className="text-muted-foreground mb-4">
                    Learn the basics of VideoMetrics.ai and set up your first analysis.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-primary hover:underline cursor-pointer">Platform Overview</li>
                    <li className="text-primary hover:underline cursor-pointer">Quick Start Guide</li>
                    <li className="text-primary hover:underline cursor-pointer">First Analysis Tutorial</li>
                    <li className="text-primary hover:underline cursor-pointer">Account Setup</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Video Sources</h3>
                  <p className="text-muted-foreground mb-4">Connect and manage your video sources for analysis.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-primary hover:underline cursor-pointer">Supported Camera Types</li>
                    <li className="text-primary hover:underline cursor-pointer">RTSP Stream Setup</li>
                    <li className="text-primary hover:underline cursor-pointer">Cloud Storage Integration</li>
                    <li className="text-primary hover:underline cursor-pointer">Video File Requirements</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Analytics Templates</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore pre-built templates for common video analytics use cases.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-primary hover:underline cursor-pointer">Retail Traffic Analysis</li>
                    <li className="text-primary hover:underline cursor-pointer">Queue Management</li>
                    <li className="text-primary hover:underline cursor-pointer">Occupancy Monitoring</li>
                    <li className="text-primary hover:underline cursor-pointer">Custom Template Creation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Advanced Features</h3>
                  <p className="text-muted-foreground mb-4">Dive deeper into powerful capabilities of the platform.</p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-primary hover:underline cursor-pointer">Custom Detection Zones</li>
                    <li className="text-primary hover:underline cursor-pointer">Demographic Analysis</li>
                    <li className="text-primary hover:underline cursor-pointer">Behavior Pattern Recognition</li>
                    <li className="text-primary hover:underline cursor-pointer">Alert Configuration</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Reports & Dashboards</h3>
                  <p className="text-muted-foreground mb-4">
                    Learn how to create, customize, and share insights from your data.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-primary hover:underline cursor-pointer">Dashboard Customization</li>
                    <li className="text-primary hover:underline cursor-pointer">Scheduled Reports</li>
                    <li className="text-primary hover:underline cursor-pointer">Data Export Options</li>
                    <li className="text-primary hover:underline cursor-pointer">Visualization Best Practices</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">API & Integrations</h3>
                  <p className="text-muted-foreground mb-4">
                    Integrate VideoMetrics.ai with your existing systems and workflows.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-primary hover:underline cursor-pointer">API Reference</li>
                    <li className="text-primary hover:underline cursor-pointer">Webhook Setup</li>
                    <li className="text-primary hover:underline cursor-pointer">Third-Party Integrations</li>
                    <li className="text-primary hover:underline cursor-pointer">Authentication & Security</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Account Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Manage your account, users, billing, and security settings.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-primary hover:underline cursor-pointer">User Roles & Permissions</li>
                    <li className="text-primary hover:underline cursor-pointer">Billing & Subscription</li>
                    <li className="text-primary hover:underline cursor-pointer">Security Settings</li>
                    <li className="text-primary hover:underline cursor-pointer">Organization Management</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <LifeBuoy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Troubleshooting</h3>
                  <p className="text-muted-foreground mb-4">
                    Find solutions to common issues and get help when you need it.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-primary hover:underline cursor-pointer">Common Issues</li>
                    <li className="text-primary hover:underline cursor-pointer">Connection Problems</li>
                    <li className="text-primary hover:underline cursor-pointer">Error Messages</li>
                    <li className="text-primary hover:underline cursor-pointer">Contact Support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-hover card-gradient border-0 lg:col-span-3">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <h3 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h3>
                      <p className="text-muted-foreground">
                        Our support team is here to help. Contact us for personalized assistance.
                      </p>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">Contact Support</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Video Tutorials</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Learn by watching our step-by-step video guides.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="card-hover border-0 shadow-md overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src="/video-analytics-intro.png"
                    alt="Getting Started Tutorial"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
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
                        className="text-white"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Getting Started with VideoMetrics.ai</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn the basics and set up your first analysis in minutes.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-md overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src="/advanced-analytics-insights.png"
                    alt="Advanced Features Tutorial"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
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
                        className="text-white"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Advanced Analytics Features</h3>
                  <p className="text-sm text-muted-foreground">
                    Dive deeper into powerful capabilities like custom zones and alerts.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-md overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src="/custom-report-tutorial.png"
                    alt="Custom Reports Tutorial"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
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
                        className="text-white"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Creating Custom Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to build and share custom reports with your team.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button variant="outline">View All Tutorials</Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Need More Help?</h2>
              <p className="text-muted-foreground mb-8">
                Our support team is ready to assist you with any questions or issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Contact Support
                </Button>
                <Button size="lg" variant="outline">
                  Join Community Forum
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
