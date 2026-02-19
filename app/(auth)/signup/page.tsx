import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'
import { Navbar } from '@/components/navigation/navbar'

export const metadata: Metadata = {
  title: 'Sign Up - EventEase',
  description: 'Create a new EventEase account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </main>
    </div>
  )
}
