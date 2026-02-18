import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password - EventHub',
  description: 'Reset your EventHub password',
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full">
      <ResetPasswordForm />
    </div>
  )
}
