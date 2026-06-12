import Link from "next/link"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Support — Castd",
  description: "Get help with Castd: account questions, troubleshooting, and contact information.",
}

const faqs = [
  {
    q: "How do I create an account?",
    a: "Tap Sign Up on the welcome screen and register with your email address. You can complete your movie and series preferences during onboarding to get better recommendations.",
  },
  {
    q: "How do I add friends?",
    a: "Go to the Friends tab and search for friends by username, or invite them with a link. Once connected, you'll see their recommendations and wishlists in your feed.",
  },
  {
    q: "How do mutual matches work?",
    a: "When you and a friend both add the same movie or show to your wishlists, Castd flags it as a match — a great pick for your next watch night.",
  },
  {
    q: "How do I reset my password?",
    a: "On the login screen, tap \"Forgot password?\" and enter your email. We'll send you a reset link.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings and choose Delete Account, or email us and we'll process the deletion for you within 30 days.",
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Castd Support</h1>
        <p className="text-slate-300 mb-10">
          Questions, feedback, or trouble with the app? We're here to help.
        </p>

        <Card className="bg-slate-800/60 border-slate-700 p-6 mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">Contact us</h2>
          <p className="text-slate-300">
            Email{" "}
            <a
              href="mailto:Roberto@reel-friends.ai"
              className="text-purple-400 underline underline-offset-4"
            >
              Roberto@reel-friends.ai
            </a>{" "}
            and we'll get back to you within 1–2 business days.
          </p>
        </Card>

        <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
        <div className="space-y-4 mb-12">
          {faqs.map((f) => (
            <Card key={f.q} className="bg-slate-800/60 border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-1">{f.q}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{f.a}</p>
            </Card>
          ))}
        </div>

        <div className="flex gap-6 text-sm text-slate-400">
          <Link href="/legal/privacy" className="hover:text-white underline underline-offset-4">
            Privacy Policy
          </Link>
          <Link href="/legal/terms" className="hover:text-white underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="/" className="hover:text-white underline underline-offset-4">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
