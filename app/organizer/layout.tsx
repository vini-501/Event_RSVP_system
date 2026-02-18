'use client'

import { Navbar } from '@/components/navigation/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={['organizer', 'admin']}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
