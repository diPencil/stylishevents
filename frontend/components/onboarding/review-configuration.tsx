"use client"

import { useOnboarding } from "@/contexts/onboarding-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Check, FileText, Video, Settings, Edit } from "lucide-react"

export function ReviewConfiguration() {
  const { setCurrentStep, completeOnboarding } = useOnboarding()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className="text-3xl font-bold mb-4 text-center">Review Your Configuration</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Please verify all the details below before starting the analysis process. You can go back to previous steps to
        make changes.
      </p>

      <div className="space-y-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Project & Analysis
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={() => setCurrentStep("template-selection")}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-sm text-muted-foreground">Project Name:</dt>
              <dd className="text-sm font-medium">Default Project Name</dd>

              <dt className="text-sm text-muted-foreground">Selected Template:</dt>
              <dd className="text-sm font-medium">Retail Queue Analysis</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-primary" />
              Video Source Details
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setCurrentStep("video-source")}>
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-sm text-muted-foreground">Source Type:</dt>
              <dd className="text-sm font-medium">AWS S3 Cloud Storage</dd>

              <dt className="text-sm text-muted-foreground">Bucket Name:</dt>
              <dd className="text-sm font-medium">my-videometrics-bucket</dd>

              <dt className="text-sm text-muted-foreground">Folder Path:</dt>
              <dd className="text-sm font-medium">videos/store-1/</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Analysis Metrics & Parameters
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setCurrentStep("configure")}>
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <h4 className="text-sm font-medium mb-2">Selected Metrics:</h4>
            <ul className="space-y-1 mb-4">
              <li className="text-sm flex items-start">
                <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Queue Length</span>
                  <p className="text-xs text-muted-foreground">Alert threshold: 5 people</p>
                </div>
              </li>
              <li className="text-sm flex items-center">
                <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                <span className="font-medium">Average Wait Time</span>
              </li>
            </ul>

            <h4 className="text-sm font-medium mb-2">Notifications:</h4>
            <p className="text-sm">Disabled (Example)</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Check className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Configuration Complete</h3>
          <p className="text-sm text-muted-foreground">
            Your analysis configuration is ready to go. Click "Start Analysis" to begin processing your video data and
            generating insights.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("configure")}>
          Back
        </Button>
        <Button onClick={() => setCurrentStep("completed")}>Start Analysis</Button>
      </div>
    </motion.div>
  )
}
