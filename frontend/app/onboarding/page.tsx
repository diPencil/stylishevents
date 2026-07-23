"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Check, Cloud, FileVideo, ShoppingCart, Timer, Upload, Users } from "lucide-react"
import { StepIndicator } from "@/components/step-indicator"

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [selectedSource, setSelectedSource] = useState("")

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(4, prev + 1))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

        <div className="container px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl font-bold">Set Up Your First Analysis</h1>
            <p className="text-muted-foreground mt-2">
              Let's get you started with your first video analysis in just a few steps
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="mb-10">
            <StepIndicator
              steps={["Choose Template", "Video Source", "Configure", "Review"]}
              currentStep={currentStep}
            />
          </div>

          {/* Step Content */}
          <Card className="card-gradient border-0 shadow-lg">
            <CardContent className="p-6">
              {/* Step 1: Choose Template */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold">Choose an Analysis Template</h2>
                  <p className="text-muted-foreground">
                    Select a template that best fits your use case, or start with a custom configuration.
                  </p>

                  <RadioGroup
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div
                      className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                        selectedTemplate === "retail-queue" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="retail-queue" id="retail-queue" className="absolute right-4 top-4" />
                      <div className="flex flex-col h-full">
                        <div className="mb-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <Label htmlFor="retail-queue" className="text-lg font-medium cursor-pointer">
                          Retail Queue Analysis
                        </Label>
                        <p className="text-muted-foreground text-sm mt-2">
                          Monitor queue lengths and customer wait times at checkout counters or service desks.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                        selectedTemplate === "foot-traffic" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="foot-traffic" id="foot-traffic" className="absolute right-4 top-4" />
                      <div className="flex flex-col h-full">
                        <div className="mb-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <Label htmlFor="foot-traffic" className="text-lg font-medium cursor-pointer">
                          Retail Foot Traffic
                        </Label>
                        <p className="text-muted-foreground text-sm mt-2">
                          Analyze customer flow, count entries/exits, and identify high-traffic zones within your store.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                        selectedTemplate === "waiting-area" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="waiting-area" id="waiting-area" className="absolute right-4 top-4" />
                      <div className="flex flex-col h-full">
                        <div className="mb-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Timer className="h-5 w-5 text-primary" />
                        </div>
                        <Label htmlFor="waiting-area" className="text-lg font-medium cursor-pointer">
                          Customer Waiting Area
                        </Label>
                        <p className="text-muted-foreground text-sm mt-2">
                          Measure average wait times and occupancy levels in waiting rooms or lobbies.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                        selectedTemplate === "custom" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="custom" id="custom" className="absolute right-4 top-4" />
                      <div className="flex flex-col h-full">
                        <div className="mb-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileVideo className="h-5 w-5 text-primary" />
                        </div>
                        <Label htmlFor="custom" className="text-lg font-medium cursor-pointer">
                          Custom Analysis
                        </Label>
                        <p className="text-muted-foreground text-sm mt-2">
                          Start from scratch and define your own specific metrics and analysis parameters.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </motion.div>
              )}

              {/* Step 2: Video Source */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold">Select Video Source</h2>
                  <p className="text-muted-foreground">
                    Connect to your existing cloud storage, live CCTV/IP camera, or upload video files directly.
                  </p>

                  <Tabs defaultValue="cloud" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
                      <TabsTrigger value="camera">Live Camera</TabsTrigger>
                      <TabsTrigger value="upload">Direct Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cloud" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cloud-provider">Cloud Provider</Label>
                        <select
                          id="cloud-provider"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select a provider</option>
                          <option value="aws">AWS S3</option>
                          <option value="gcp">Google Cloud Storage</option>
                          <option value="azure">Azure Blob Storage</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bucket-path">Bucket/Container Path</Label>
                        <Input id="bucket-path" placeholder="e.g., my-bucket/videos/" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="access-key">Access Key/Connection String</Label>
                        <Input id="access-key" type="password" placeholder="Enter your access credentials" />
                        <p className="text-xs text-muted-foreground">
                          Your credentials are encrypted and securely stored.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="camera" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="camera-url">Camera Stream URL</Label>
                        <Input id="camera-url" placeholder="rtsp://camera-ip-address:port/stream" />
                        <p className="text-xs text-muted-foreground">
                          Enter the RTSP, HTTP, or other streaming URL for your camera.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="camera-credentials">Camera Credentials (Optional)</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Input id="camera-username" placeholder="Username" />
                          <Input id="camera-password" type="password" placeholder="Password" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="camera-name">Camera Name/Location</Label>
                        <Input id="camera-name" placeholder="e.g., Front Entrance" />
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Drag & Drop Video Files</h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-4">
                          Or click to browse your files (MP4, AVI, MOV up to 2GB)
                        </p>
                        <Button variant="outline">Select Files</Button>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>Supported formats: MP4, AVI, MOV, MKV</p>
                        <p>Maximum file size: 2GB per file</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}

              {/* Step 3: Configure */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold">Configure Analysis Parameters</h2>
                  <p className="text-muted-foreground">
                    Set up your analytics parameters, detection zones, and custom metrics to track.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="analysis-name">Analysis Name</Label>
                        <Input id="analysis-name" placeholder="e.g., Store Entrance Traffic Analysis" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="detection-objects">Objects to Detect</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" className="bg-primary/10 border-primary/30">
                            People <Check className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline">Vehicles</Button>
                          <Button variant="outline">Faces</Button>
                          <Button variant="outline">Custom...</Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="metrics">Metrics to Track</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" className="bg-primary/10 border-primary/30">
                            Count <Check className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline" className="bg-primary/10 border-primary/30">
                            Dwell Time <Check className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline">Path Tracking</Button>
                          <Button variant="outline">Interactions</Button>
                          <Button variant="outline">Custom...</Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schedule">Analysis Schedule</Label>
                        <select
                          id="schedule"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="continuous">Continuous (24/7)</option>
                          <option value="business-hours">Business Hours Only</option>
                          <option value="custom">Custom Schedule</option>
                          <option value="one-time">One-time Analysis</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Detection Zones</Label>
                        <div className="relative border rounded-md overflow-hidden aspect-video bg-muted">
                          <img
                            src="/security-camera-zones.png"
                            alt="Detection Zones"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-sm text-center px-4 py-2 bg-background/80 rounded-md">
                              Draw zones on the video frame to define areas of interest
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Click and drag to create detection zones. Double-click to complete a zone.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <Button variant="outline" size="sm">
                            Low
                          </Button>
                          <Button variant="outline" size="sm" className="bg-primary/10 border-primary/30">
                            Medium <Check className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            High
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Higher sensitivity may detect more objects but could increase false positives.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold">Review and Launch</h2>
                  <p className="text-muted-foreground">
                    Review your configuration, test the connection, and deploy your analytics solution.
                  </p>

                  <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Analysis Template</h3>
                        <p className="text-base font-medium">Retail Foot Traffic</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Analysis Name</h3>
                        <p className="text-base font-medium">Store Entrance Traffic Analysis</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Video Source</h3>
                        <p className="text-base font-medium">Live Camera (RTSP Stream)</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Schedule</h3>
                        <p className="text-base font-medium">Continuous (24/7)</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Objects to Detect</h3>
                        <p className="text-base font-medium">People</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Metrics to Track</h3>
                        <p className="text-base font-medium">Count, Dwell Time</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Detection Zones</h3>
                      <div className="relative border rounded-md overflow-hidden aspect-video bg-muted">
                        <img
                          src="/security-zones-overlay.png"
                          alt="Configured Detection Zones"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Cloud className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Connection Test Successful</h3>
                      <p className="text-sm text-muted-foreground">
                        We've successfully connected to your video source and verified that we can process the video
                        stream.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                <Button
                  onClick={currentStep < 4 ? nextStep : () => (window.location.href = "/dashboard")}
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  {currentStep < 4 ? (
                    <>
                      Next <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Launch Analysis <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
