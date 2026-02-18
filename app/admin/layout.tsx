'use client'

import { Navbar } from '@/components/navigation/navbar'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
