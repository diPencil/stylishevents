"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EnhancedBackground } from "@/components/enhanced-background"
import { Floating3DCard } from "@/components/floating-3d-card"
import {
  BarChart3,
  Camera,
  Cloud,
  Code,
  Cog,
  Database,
  Eye,
  FileText,
  LineChart,
  Lock,
  MessageSquare,
  Share2,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react"

export default function Features() {
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
                Powerful Features for <span className="text-gradient">Video Analytics</span>
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Discover how VideoMetrics.ai transforms your video data into actionable business intelligence with our
                comprehensive suite of features.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Core Capabilities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform offers a comprehensive set of tools to analyze, visualize, and extract insights from your
                video data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Floating3DCard className="h-full">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Advanced Object Detection</h3>
                  <p className="text-muted-foreground flex-grow">
                    Accurately detect and track people, vehicles, and objects in your video footage with
                    state-of-the-art computer vision algorithms.
                  </p>
                  <div className="mt-4 pt-4 border-t">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        99.2% detection accuracy
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        Real-time tracking capabilities
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        Custom object recognition
                      </li>
                    </ul>
                  </div>
                </div>
              </Floating3DCard>

              <Floating3DCard className="h-full">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Rich Visualizations</h3>
                  <p className="text-muted-foreground flex-grow">
                    Transform complex video data into clear, actionable insights with our comprehensive suite of
                    visualization tools.
                  </p>
                  <div className="mt-4 pt-4 border-t">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        Interactive heatmaps
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        Time-series charts
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        Custom dashboards
                      </li>
                    </ul>
                  </div>
                </div>
              </Floating3DCard>

              <Floating3DCard className="h-full">
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
                  <p className="text-muted-foreground flex-grow">
                    Let our advanced AI analyze your video data and automatically generate actionable recommendations.
                  </p>
                  <div className="mt-4 pt-4 border-t">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        Anomaly detection
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        Predictive analytics
                      </li>
                      <li className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2">
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
                        Automated recommendations
                      </li>
                    </ul>
                  </div>
                </div>
              </Floating3DCard>
            </div>
          </div>
        </section>

        {/* Integration Features */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Flexible Integration</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect to your existing video sources and integrate with your business systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Camera Compatibility</h3>
                  <p className="text-muted-foreground">
                    Connect to virtually any IP camera or CCTV system using RTSP, RTMP, or HTTP streaming protocols.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Cloud className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Cloud Storage</h3>
                  <p className="text-muted-foreground">
                    Seamlessly connect to AWS S3, Google Cloud Storage, Azure Blob Storage, or your existing
                    surveillance cloud.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">API Access</h3>
                  <p className="text-muted-foreground">
                    Integrate video analytics into your applications with our comprehensive REST API and webhooks.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Advanced Capabilities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore the powerful features that set VideoMetrics.ai apart from traditional video analytics solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Demographic Analysis</h3>
                  <p className="text-muted-foreground text-sm">
                    Gain insights into customer demographics with age and gender estimation.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Behavior Patterns</h3>
                  <p className="text-muted-foreground text-sm">
                    Identify common movement patterns and customer behaviors in your space.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Historical Analysis</h3>
                  <p className="text-muted-foreground text-sm">
                    Compare current metrics with historical data to identify trends and anomalies.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Alerts & Notifications</h3>
                  <p className="text-muted-foreground text-sm">
                    Set up custom triggers and receive real-time alerts via email, SMS, or webhooks.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Custom Reports</h3>
                  <p className="text-muted-foreground text-sm">
                    Generate and schedule custom reports tailored to your specific business needs.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Share2 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Collaboration Tools</h3>
                  <p className="text-muted-foreground text-sm">
                    Share insights and collaborate with team members through our platform.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Cog className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Custom Analytics</h3>
                  <p className="text-muted-foreground text-sm">
                    Define your own metrics and KPIs to track what matters most to your business.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient border-0">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Privacy Controls</h3>
                  <p className="text-muted-foreground text-sm">
                    Maintain compliance with privacy regulations with built-in anonymization features.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Enterprise-Grade Security & Privacy</h2>
                <p className="text-muted-foreground mb-6">
                  We take security and privacy seriously. VideoMetrics.ai is built with enterprise-grade security
                  features and privacy controls to protect your data.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      <Lock className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">End-to-End Encryption</h3>
                      <p className="text-sm text-muted-foreground">
                        All data is encrypted in transit and at rest using industry-standard encryption protocols.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">GDPR & CCPA Compliant</h3>
                      <p className="text-sm text-muted-foreground">
                        Our platform is designed to help you maintain compliance with global privacy regulations.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      <Users className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Role-Based Access Control</h3>
                      <p className="text-sm text-muted-foreground">
                        Define granular permissions to control who can access your video data and analytics.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
                <img
                  src="/security-shield.png"
                  alt="Security & Privacy"
                  className="relative z-10 rounded-lg shadow-xl w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Ready to Transform Your Video Data?</h2>
              <p className="text-muted-foreground mb-8">
                Start turning your video footage into actionable insights today with VideoMetrics.ai.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline">
                  Schedule Demo
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
