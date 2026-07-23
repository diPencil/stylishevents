"use client"

import { useState } from "react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

export function ConfigureAnalysis() {
  const { setCurrentStep } = useOnboarding()
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["queue-length", "wait-time"])

  const toggleMetric = (id: string) => {
    if (selectedMetrics.includes(id)) {
      setSelectedMetrics(selectedMetrics.filter((m) => m !== id))
    } else {
      setSelectedMetrics([...selectedMetrics, id])
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className="text-3xl font-bold mb-4 text-center">Configure Analysis Metrics</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Select the metrics you want to track. Options may be pre-selected based on your chosen template. Adjust
        parameters as needed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>People & Queue Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-md border">
                <Checkbox
                  id="queue-length"
                  checked={selectedMetrics.includes("queue-length")}
                  onCheckedChange={() => toggleMetric("queue-length")}
                />
                <div className="space-y-1">
                  <Label htmlFor="queue-length" className="text-base font-medium">
                    Queue Length
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Count the number of people waiting in a defined queue area.
                  </p>

                  {selectedMetrics.includes("queue-length") && (
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="alert-threshold" className="text-sm">
                            Alert Threshold (People)
                          </Label>
                          <Input id="alert-threshold" type="number" defaultValue={5} className="h-8" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-md border">
                <Checkbox
                  id="wait-time"
                  checked={selectedMetrics.includes("wait-time")}
                  onCheckedChange={() => toggleMetric("wait-time")}
                />
                <div className="space-y-1">
                  <Label htmlFor="wait-time" className="text-base font-medium">
                    Average Wait Time
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Estimate the average time customers spend waiting in the queue.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-md border">
                <Checkbox
                  id="foot-traffic"
                  checked={selectedMetrics.includes("foot-traffic")}
                  onCheckedChange={() => toggleMetric("foot-traffic")}
                />
                <div className="space-y-1">
                  <Label htmlFor="foot-traffic" className="text-base font-medium">
                    Foot Traffic Count
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Count people entering or exiting a defined area or crossing a line.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Object & Vehicle Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-md border">
                <Checkbox
                  id="vehicle-detection"
                  checked={selectedMetrics.includes("vehicle-detection")}
                  onCheckedChange={() => toggleMetric("vehicle-detection")}
                />
                <div className="space-y-1">
                  <Label htmlFor="vehicle-detection" className="text-base font-medium">
                    Vehicle Detection & Count
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Detect and count vehicles (cars, trucks, etc.) in a specific zone.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-md border">
                <Checkbox
                  id="object-presence"
                  checked={selectedMetrics.includes("object-presence")}
                  onCheckedChange={() => toggleMetric("object-presence")}
                />
                <div className="space-y-1">
                  <Label htmlFor="object-presence" className="text-base font-medium">
                    Object Presence / Dwell Time
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Detect if specific objects (e.g., luggage, equipment) are present and for how long.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Template:</span>
                  <span className="text-sm font-medium">Retail Queue Analysis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Video Source:</span>
                  <span className="text-sm font-medium">AWS S3 Bucket</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Source Detail:</span>
                  <span className="text-sm font-medium">my-videos/store-1</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Selected Metrics:</h4>
                <ul className="space-y-1">
                  {selectedMetrics.includes("queue-length") && (
                    <li className="text-sm flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      Queue Length
                    </li>
                  )}
                  {selectedMetrics.includes("wait-time") && (
                    <li className="text-sm flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      Average Wait Time
                    </li>
                  )}
                  {selectedMetrics.includes("foot-traffic") && (
                    <li className="text-sm flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      Foot Traffic Count
                    </li>
                  )}
                  {selectedMetrics.includes("vehicle-detection") && (
                    <li className="text-sm flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      Vehicle Detection & Count
                    </li>
                  )}
                  {selectedMetrics.includes("object-presence") && (
                    <li className="text-sm flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                      Object Presence / Dwell Time
                    </li>
                  )}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">Review details on the next step.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("video-source")}>
          Back
        </Button>
        <Button onClick={() => setCurrentStep("review")} disabled={selectedMetrics.length === 0}>
          Next: Review & Start
        </Button>
      </div>
    </motion.div>
  )
}
