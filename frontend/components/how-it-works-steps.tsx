import Image from "next/image"
import { Card } from "@/components/ui/card"

export function HowItWorksSteps() {
  const steps = [
    {
      number: "1",
      title: "Connect Your Video",
      description:
        "Easily link your cloud storage, CCTV streams, or upload video files directly. We support all major formats and protocols.",
      image: "/connect-video-options.png",
      alt: "Cloud and camera connection options",
    },
    {
      number: "2",
      title: "Configure Analysis",
      description:
        "Choose a template or define custom metrics relevant to your specific goals. Set up zones, tracking parameters, and alerts.",
      image: "/analytics-configuration.png",
      alt: "Analytics configuration dashboard",
    },
    {
      number: "3",
      title: "Visualize & Act",
      description:
        "Access real-time data, historical trends, and alerts on your dashboard to make informed decisions that drive business growth.",
      image: "/people-count-timeline.png",
      alt: "People count visualization graph",
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-muted/50 to-muted/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Get Insights in 3 Simple Steps</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our streamlined process gets you from setup to actionable insights in minutes, not days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground mb-6">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground mb-8">{step.description}</p>

              {/* Image container with consistent aspect ratio */}
              <Card className="w-full overflow-hidden">
                <div className="aspect-[4/3] relative w-full">
                  <Image src={step.image || "/placeholder.svg"} alt={step.alt} fill className="object-cover" />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
