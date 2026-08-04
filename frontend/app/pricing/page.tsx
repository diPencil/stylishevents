"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedBackground } from "@/components/enhanced-background"
import { Check, HelpCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

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
                Simple, Transparent <span className="text-gradient">Pricing</span>
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Choose the plan that's right for your business. All plans include core analytics features.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex justify-center mb-12"
              >
                <Tabs
                  defaultValue="monthly"
                  value={billingCycle}
                  onValueChange={(value) => setBillingCycle(value as "monthly" | "annual")}
                  className="w-[400px]"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                    <TabsTrigger value="annual">
                      Annual Billing
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Save 20%
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden h-full">
                  <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <CardHeader>
                    <CardTitle>Starter</CardTitle>
                    <CardDescription>
                      Perfect for small businesses just getting started with video analytics.
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${billingCycle === "monthly" ? "99" : "79"}</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                      {billingCycle === "annual" && (
                        <div className="text-sm text-primary font-medium mt-1">Billed annually (${79 * 12})</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>2 video sources</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Up to 720p resolution</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>7 days data retention</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Basic analytics templates</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Email support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600">Start Free Trial</Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Professional Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="md:-mt-4"
              >
                <Card className="border-0 shadow-xl overflow-hidden h-full relative">
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                  <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
                  <CardHeader>
                    <CardTitle>Professional</CardTitle>
                    <CardDescription>Ideal for growing businesses with multiple locations.</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${billingCycle === "monthly" ? "249" : "199"}</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                      {billingCycle === "annual" && (
                        <div className="text-sm text-primary font-medium mt-1">Billed annually (${199 * 12})</div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>10 video sources</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Up to 1080p resolution</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>30 days data retention</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>All analytics templates</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Custom reports</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority email & chat support</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>API access</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary">Start Free Trial</Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden h-full">
                  <div className="h-2 bg-gradient-to-r from-purple-600 to-purple-800"></div>
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                    <CardDescription>Advanced features for large organizations with complex needs.</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">Custom</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Unlimited video sources</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Up to 4K resolution</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Custom data retention</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Custom analytics development</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>Dedicated account manager</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>24/7 phone & email support</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>On-premises deployment option</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800">Contact Sales</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Compare Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See which plan is right for your business needs.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-6 font-medium">Feature</th>
                    <th className="text-center py-4 px-6 font-medium">Starter</th>
                    <th className="text-center py-4 px-6 font-medium">Professional</th>
                    <th className="text-center py-4 px-6 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">Video Sources</td>
                    <td className="text-center py-4 px-6">2</td>
                    <td className="text-center py-4 px-6">10</td>
                    <td className="text-center py-4 px-6">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">Max Resolution</td>
                    <td className="text-center py-4 px-6">720p</td>
                    <td className="text-center py-4 px-6">1080p</td>
                    <td className="text-center py-4 px-6">4K</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">Data Retention</td>
                    <td className="text-center py-4 px-6">7 days</td>
                    <td className="text-center py-4 px-6">30 days</td>
                    <td className="text-center py-4 px-6">Custom</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">People Counting</td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">Dwell Time Analysis</td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">Heatmaps</td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">Custom Reports</td>
                    <td className="text-center py-4 px-6">—</td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">API Access</td>
                    <td className="text-center py-4 px-6">—</td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">Demographic Analysis</td>
                    <td className="text-center py-4 px-6">—</td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">Custom Analytics</td>
                    <td className="text-center py-4 px-6">—</td>
                    <td className="text-center py-4 px-6">—</td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 px-6 font-medium">On-Premises Deployment</td>
                    <td className="text-center py-4 px-6">—</td>
                    <td className="text-center py-4 px-6">—</td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Have questions? We've got answers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    How does the free trial work?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our 14-day free trial gives you full access to all features in the Professional plan. No credit card
                    required to start. You can upgrade to a paid plan at any time during or after your trial.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    Can I change plans later?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, you can upgrade, downgrade, or cancel your plan at any time. When upgrading, you'll be prorated
                    for the remainder of your billing cycle. When downgrading, changes take effect at the end of your
                    current billing cycle.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    What types of cameras are supported?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    VideoMetrics.ai supports virtually any IP camera or CCTV system that can provide an RTSP, RTMP, or
                    HTTP stream. We also support direct video file uploads and integration with cloud storage providers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    Is my data secure?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, we take security seriously. All data is encrypted in transit and at rest. We use
                    industry-standard security practices and regularly undergo security audits. We also offer privacy
                    features like face blurring and zone exclusion.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    Do you offer custom solutions?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, our Enterprise plan includes custom analytics development tailored to your specific business
                    needs. Contact our sales team to discuss your requirements and get a custom quote.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                    What support is included?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All plans include email support. Professional plans add chat support with priority response times.
                    Enterprise plans include 24/7 phone support and a dedicated account manager to help you get the most
                    out of the platform.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="mb-4 text-2xl font-bold md:text-4xl lg:text-5xl">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8">Start your 14-day free trial today. No credit card required.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline">
                  Contact Sales
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
