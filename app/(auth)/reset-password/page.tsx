import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { Navbar } from '@/components/navigation/navbar'

export const metadata: Metadata = {
  title: 'Reset Password - EventEase',
  description: 'Reset your EventEase password',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <ResetPasswordForm />
        </div>
      </main>
    </div>
  )
}
