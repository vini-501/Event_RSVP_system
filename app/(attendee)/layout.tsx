'use client'

import { Navbar } from '@/components/navigation/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function AttendeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={['attendee']}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
