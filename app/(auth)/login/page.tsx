import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Login - EventHub',
  description: 'Sign in to your EventHub account',
}

export default function LoginPage() {
  return (
    <div className="w-full">
      <LoginForm />
    </div>
  )
}
