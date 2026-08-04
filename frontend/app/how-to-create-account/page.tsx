import type { Metadata } from "next"
import { CreateAccountGuidePageContent } from "@/components/public/supporting-pages"

export const metadata: Metadata = {
  title: "How to Create an Account",
  description: "Step-by-step guide for creating a Stylish Events customer account and accessing the customer dashboard.",
  alternates: { canonical: "/how-to-create-account" },
}

export default function HowToCreateAccountPage() {
  return <CreateAccountGuidePageContent />
}
