import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { Calendar, Users, BarChart3, Shield, Zap, Globe } from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Event Management',
    description: 'Create, organize, and manage events with an intuitive dashboard.',
  },
  {
    icon: Users,
    title: 'RSVP Tracking',
    description: 'Real-time RSVP tracking with waitlist management and capacity controls.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Detailed analytics to understand attendee behavior and event performance.',
  },
  {
    icon: Shield,
    title: 'Secure Check-in',
    description: 'QR code-based check-in system with real-time attendance tracking.',
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    description: 'Keep attendees informed with automated email and in-app notifications.',
  },
  {
    icon: Globe,
    title: 'Public Event Pages',
    description: 'Beautiful, shareable event pages that drive registrations.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              ✨ The modern event platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Manage events{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                effortlessly
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Create stunning events, track RSVPs in real-time, and deliver unforgettable
              experiences — all from one beautiful dashboard.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href={ROUTES.EVENTS}>
                <Button size="lg" className="rounded-xl shadow-lg shadow-primary/25 px-8">
                  Explore Events
                </Button>
              </Link>
              <Link href={ROUTES.SIGNUP}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to run great events
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools designed for organizers who care about the attendee experience.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="group border-border/60 hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to create your next event?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of organizers who use EventHub to create memorable experiences.
          </p>
          <Link href={ROUTES.SIGNUP}>
            <Button size="lg" className="rounded-xl shadow-lg shadow-primary/25 px-8">
              Start for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
