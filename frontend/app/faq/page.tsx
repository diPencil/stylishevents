import type { Metadata } from "next"
import { FaqPageContent } from "@/components/public/supporting-pages"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about Stylish Events customer accounts, login, event registration, tickets, QR check-in, certificates, reviews, and support.",
  alternates: { canonical: "/faq" },
}

export default function FaqPage() {
  return <FaqPageContent />
}
