import type { Metadata } from "next"
import { ReceptionAndFarewellPageContent } from "@/components/public/supporting-pages"

export const metadata: Metadata = {
  title: "Reception and Farewell",
  description: "Professional guest reception, registration desk support, VIP arrival handling, venue guidance, and farewell coordination for events.",
  alternates: { canonical: "/reception-and-farewell" },
}

export default function ReceptionAndFarewellPage() {
  return <ReceptionAndFarewellPageContent />
}
