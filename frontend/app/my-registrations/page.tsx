import { redirect } from "next/navigation"

export default function MyRegistrationsRedirectPage() {
  redirect("/dashboard/registrations")
}
