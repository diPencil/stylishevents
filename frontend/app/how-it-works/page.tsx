"use client"

import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HowItWorksSteps } from "@/components/how-it-works-steps"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  CheckCircle,
  CloudCog,
  Code,
  Database,
  LineChart,
  Lock,
  MonitorSmartphone,
  Network,
  Settings,
  Zap,
} from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">How VideoMetrics.ai Works</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transform your video data into actionable business intelligence with our powerful yet simple analytics
                platform.
              </p>
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <HowItWorksSteps />

        {/* Additional content can go here */}

        {/* Technology Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">The Technology Behind VideoMetrics.ai</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our platform combines cutting-edge AI with scalable cloud architecture to deliver accurate, real-time
                insights
              </p>
            </div>

            <Tabs defaultValue="ai" className="max-w-4xl mx-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
                <TabsTrigger value="ai">AI & ML</TabsTrigger>
                <TabsTrigger value="cloud">Cloud Architecture</TabsTrigger>
                <TabsTrigger value="security">Security & Privacy</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Advanced AI & Machine Learning</h3>
                    <p className="text-muted-foreground mb-6">
                      Our proprietary AI models are trained on millions of hours of video data to deliver
                      industry-leading accuracy in object detection, people counting, behavior analysis, and pattern
                      recognition.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <Network className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Deep Neural Networks</h4>
                          <p className="text-sm text-muted-foreground">
                            Custom-trained convolutional neural networks for accurate object detection and
                            classification
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <LineChart className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Predictive Analytics</h4>
                          <p className="text-sm text-muted-foreground">
                            Time-series forecasting to predict trends and anomalies in your business metrics
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <Zap className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Real-time Processing</h4>
                          <p className="text-sm text-muted-foreground">
                            Edge computing capabilities for instant analysis and low-latency insights
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
                    <Image src="/security-zones-overlay.png" alt="AI object detection" fill className="object-cover" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cloud" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Scalable Cloud Architecture</h3>
                    <p className="text-muted-foreground mb-6">
                      Our platform is built on a modern, microservices-based architecture that scales automatically to
                      handle any volume of video data, from a single location to thousands of sites worldwide.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <CloudCog className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Elastic Scaling</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatically adjusts resources based on demand for consistent performance
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <Database className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Distributed Processing</h4>
                          <p className="text-sm text-muted-foreground">
                            Parallel processing architecture for handling high volumes of video data
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <MonitorSmartphone className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Multi-device Access</h4>
                          <p className="text-sm text-muted-foreground">
                            Access your analytics from any device with our responsive web application
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src="/san-francisco-tech-clusters.png"
                      alt="Cloud architecture"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Enterprise-grade Security & Privacy</h3>
                    <p className="text-muted-foreground mb-6">
                      We prioritize the security and privacy of your data with comprehensive measures that exceed
                      industry standards and comply with global privacy regulations.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <Lock className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">End-to-end Encryption</h4>
                          <p className="text-sm text-muted-foreground">
                            All data is encrypted in transit and at rest using industry-standard protocols
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <Settings className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Privacy Controls</h4>
                          <p className="text-sm text-muted-foreground">
                            Configurable privacy settings including face blurring and data retention policies
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <CheckCircle className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Compliance Ready</h4>
                          <p className="text-sm text-muted-foreground">
                            Built to comply with GDPR, CCPA, and other privacy regulations
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
                    <Image src="/security-camera-zones.png" alt="Security and privacy" fill className="object-cover" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="integration" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">Seamless Integration Capabilities</h3>
                    <p className="text-muted-foreground mb-6">
                      Connect VideoMetrics.ai with your existing business systems through our comprehensive API and
                      pre-built integrations for a unified operational view.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <Code className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">RESTful API</h4>
                          <p className="text-sm text-muted-foreground">
                            Comprehensive API for custom integrations with your existing systems
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <ArrowRight className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Pre-built Connectors</h4>
                          <p className="text-sm text-muted-foreground">
                            Ready-to-use integrations with popular business systems and platforms
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 mr-3 mt-0.5">
                          <Database className="h-5 w-5 text-teal-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Data Export</h4>
                          <p className="text-sm text-muted-foreground">
                            Flexible data export options in multiple formats for further analysis
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src="/analytics-template-selection.png"
                      alt="Integration capabilities"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Setup Process Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Simple Setup Process</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get up and running with VideoMetrics.ai in just a few simple steps
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-12">
                <div className="grid md:grid-cols-5 gap-6 items-center">
                  <div className="md:col-span-1 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold">
                      1
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
                    <p className="text-muted-foreground mb-4">
                      Sign up for a free account to get started. No credit card required for the trial period.
                    </p>
                    <Link href="/signup">
                      <Button className="bg-teal-500 hover:bg-teal-600">Sign Up Free</Button>
                    </Link>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-6 items-center">
                  <div className="md:col-span-1 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold">
                      2
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-xl font-semibold mb-2">Connect Your Video Sources</h3>
                    <p className="text-muted-foreground mb-4">
                      Link your existing cameras or upload video files using our intuitive connection wizard. We'll
                      guide you through the process step by step.
                    </p>
                    <Card className="border border-gray-200 dark:border-gray-800">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-2">Supported Video Sources:</p>
                          <ul className="grid grid-cols-2 gap-2">
                            <li>• RTSP Streams</li>
                            <li>• IP Cameras</li>
                            <li>• Cloud Storage</li>
                            <li>• Local Files</li>
                            <li>• CCTV Systems</li>
                            <li>• NVR/DVR Systems</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-6 items-center">
                  <div className="md:col-span-1 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold">
                      3
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-xl font-semibold mb-2">Select Your Analytics</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose from our library of pre-built templates or create custom analytics configurations. Our team
                      is available to help you set up the perfect solution for your needs.
                    </p>
                    <Card className="border border-gray-200 dark:border-gray-800">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-2">Popular Analytics Templates:</p>
                          <ul className="grid grid-cols-2 gap-2">
                            <li>• Retail Traffic Analysis</li>
                            <li>• Queue Management</li>
                            <li>• Heatmap Generation</li>
                            <li>• Dwell Time Analysis</li>
                            <li>• Conversion Tracking</li>
                            <li>• Occupancy Monitoring</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-6 items-center">
                  <div className="md:col-span-1 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold">
                      4
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-xl font-semibold mb-2">Access Your Dashboard</h3>
                    <p className="text-muted-foreground mb-4">
                      Start exploring your data through our intuitive dashboard. Set up alerts, create reports, and
                      begin making data-driven decisions for your business.
                    </p>
                    <Link href="/dashboard">
                      <Button className="bg-teal-500 hover:bg-teal-600">View Demo Dashboard</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Common questions about VideoMetrics.ai and how it works
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Do I need special cameras to use VideoMetrics.ai?</h3>
                  <p className="text-muted-foreground">
                    No, VideoMetrics.ai works with most standard IP cameras and CCTV systems. Our platform is designed
                    to be compatible with your existing camera infrastructure, eliminating the need for expensive
                    hardware upgrades.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">How accurate is the analytics data?</h3>
                  <p className="text-muted-foreground">
                    Our AI models achieve 95-99% accuracy in most environments, depending on camera placement and
                    conditions. We continuously train and improve our models to ensure the highest possible accuracy for
                    your specific use case.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Is my data secure and private?</h3>
                  <p className="text-muted-foreground">
                    Yes, security and privacy are our top priorities. All data is encrypted both in transit and at rest.
                    We offer privacy-enhancing features like automatic face blurring and configurable data retention
                    policies. Our platform is designed to comply with GDPR, CCPA, and other privacy regulations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">How long does it take to set up?</h3>
                  <p className="text-muted-foreground">
                    Most customers are up and running within a day. Simple setups can be completed in as little as 30
                    minutes. For more complex deployments with multiple locations or custom analytics requirements, our
                    team provides dedicated support to ensure a smooth implementation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Can I integrate VideoMetrics.ai with my existing systems?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, VideoMetrics.ai is designed with integration in mind. We offer a comprehensive API and
                    pre-built connectors for popular business systems including POS systems, ERP platforms, CRM
                    software, and business intelligence tools. Our team can help you set up custom integrations for your
                    specific needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Ready to Transform Your Video Data?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of businesses already using VideoMetrics.ai to gain actionable insights and drive better
                decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="border-teal-500 text-teal-500 hover:bg-teal-500/10">
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
