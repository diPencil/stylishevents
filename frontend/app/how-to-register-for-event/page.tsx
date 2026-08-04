import type { Metadata } from "next"
import { RegisterForEventGuidePageContent } from "@/components/public/supporting-pages"

export const metadata: Metadata = {
  title: "How to Register for an Event",
  description: "Step-by-step guide for browsing events, selecting tickets, submitting registration, and tracking approval in the customer dashboard.",
  alternates: { canonical: "/how-to-register-for-event" },
}

export default function HowToRegisterForEventPage() {
  return <RegisterForEventGuidePageContent />
}
