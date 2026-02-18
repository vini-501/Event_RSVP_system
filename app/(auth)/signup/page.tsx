import { Metadata } from 'next'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up - EventHub',
  description: 'Create a new EventHub account',
}

export default function SignupPage() {
  return (
    <div className="w-full">
      <SignupForm />
    </div>
  )
}
