import { permanentRedirect } from "next/navigation"

export default function WhyUsRedirectPage() {
  permanentRedirect("/about")
}
