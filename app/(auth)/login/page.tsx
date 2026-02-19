import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Login - EventEase',
  description: 'Sign in to your EventEase account',
}

export default function LoginPage() {
  return <LoginForm />
}
