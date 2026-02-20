'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export default function RSVPPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const router = useRouter()

  useEffect(() => {
    router.replace(ROUTES.EVENT_DETAILS(eventId))
  }, [eventId, router])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href={ROUTES.EVENT_DETAILS(eventId)}>
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Button>
      </Link>
      <p className="text-sm text-muted-foreground">Redirecting to the event page...</p>
    </div>
  )
}
