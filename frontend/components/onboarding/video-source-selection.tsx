"use client"

import { useState } from "react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Cloud, Camera, Upload, HandshakeIcon } from "lucide-react"

export function VideoSourceSelection() {
  const { setCurrentStep } = useOnboarding()
  const [selectedSource, setSelectedSource] = useState("cloud")

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 className="text-3xl font-bold mb-4 text-center">Select Video Source</h2>
      <p className="text-muted-foreground mb-8 text-center">Where is the video footage you want to analyze located?</p>

      <Tabs defaultValue="cloud" value={selectedSource} onValueChange={setSelectedSource} className="mb-8">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
          <TabsTrigger value="camera">Live Camera</TabsTrigger>
          <TabsTrigger value="vendor">Vendor Cloud</TabsTrigger>
          <TabsTrigger value="upload">Direct Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="cloud" className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Cloud Storage</h3>
            <p className="text-sm text-muted-foreground">
              Connect to your existing AWS S3, Google Cloud Storage, or Azure Blob Storage bucket.
            </p>
          </div>

          <div className="space-y-4">
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
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bucket-path">Bucket/Container Path</Label>
              <Input id="bucket-path" placeholder="e.g., my-bucket/videos/" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="access-key">Access Key/Connection String</Label>
              <Input id="access-key" type="password" placeholder="Enter your access credentials" />
              <p className="text-xs text-muted-foreground">Your credentials are encrypted and securely stored.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="camera" className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Live CCTV/IP Camera</h3>
            <p className="text-sm text-muted-foreground">
              Provide the RTSP or other stream URL for a live camera feed.
            </p>
          </div>

          <div className="space-y-4">
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
          </div>
        </TabsContent>

        <TabsContent value="vendor" className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <HandshakeIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Vendor Cloud Storage</h3>
            <p className="text-sm text-muted-foreground">
              Connect to storage provided by your surveillance vendor (e.g., Verkada, Eagle Eye).
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-name">Vendor Name</Label>
              <select
                id="vendor-name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a vendor</option>
                <option value="verkada">Verkada</option>
                <option value="eagle-eye">Eagle Eye</option>
                <option value="avigilon">Avigilon</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key/Token</Label>
              <Input id="api-key" type="password" placeholder="Enter your API key or token" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization-id">Organization ID/Account ID</Label>
              <Input id="organization-id" placeholder="Enter your organization or account ID" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Direct Upload</h3>
            <p className="text-sm text-muted-foreground">
              Upload video files directly from your computer (e.g., MP4, AVI, MOV).
            </p>
          </div>

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

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("template-selection")}>
          Back
        </Button>
        <Button onClick={() => setCurrentStep("configure")}>Next: Configure Analysis</Button>
      </div>
    </motion.div>
  )
}
