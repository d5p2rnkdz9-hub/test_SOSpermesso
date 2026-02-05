import { redirect } from "next/navigation"

/**
 * Home page - Redirects to quiz
 * This is a single-purpose app for the pre-training assessment
 */
export default function Home() {
  redirect("/quiz")
}
