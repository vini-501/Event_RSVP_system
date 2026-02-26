'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle2, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants'

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Must include a lowercase letter')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^a-zA-Z0-9]/, 'Must include a special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type Values = z.infer<typeof schema>

export function UpdatePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: Values) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) throw updateError
      setIsSuccess(true)
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN)
      }, 3000)
    } catch (e) {
      console.error('Update password error:', e)
      setError(e instanceof Error ? e.message : 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rf-container">
      {isSuccess ? (
        <>
          <div className="rf-icon-wrap rf-icon-success">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="rf-title">Password updated</h1>
          <p className="rf-desc mb-10">
            Your password has been successfully reset. You can now use your new password to sign in.
          </p>
          <div className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium flex items-center justify-center">
            <span className="rf-spin rf-spin-emerald mr-3" />
            Redirecting to login...
          </div>
        </>
      ) : (
        <>
          <div className="mb-10 w-full">
            <div className="rf-icon-wrap rf-icon-lock">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="rf-title">Set new password</h1>
            <p className="rf-desc">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="rf-form" noValidate>
            <div className="rf-field">
              <label className="rf-label">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`rf-input ${form.formState.errors.password ? 'rf-input-err' : ''}`}
                  disabled={isSubmitting}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  className="rf-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <span className="rf-err">{form.formState.errors.password.message}</span>
              )}
            </div>

            <div className="rf-field">
              <label className="rf-label">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`rf-input ${form.formState.errors.confirmPassword ? 'rf-input-err' : ''}`}
                disabled={isSubmitting}
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <span className="rf-err">{form.formState.errors.confirmPassword.message}</span>
              )}
            </div>

            {error && <div className="rf-alert">{error}</div>}

            <button type="submit" className="rf-btn" disabled={isSubmitting}>
              {isSubmitting ? <span className="rf-spin" /> : (
                <>
                  Reset Password
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </>
      )}

      <style jsx global>{`
        .rf-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .rf-icon-wrap {
          width: 64px; height: 64px;
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2.5rem;
        }
        .rf-icon-lock { background: #f5f3ff; border: 2.5px solid #8b5cf6; }
        .rf-icon-success { background: #ecfdf5; border: 2.5px solid #10b981; }
        .rf-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.03em;
          margin-bottom: 0.85rem;
        }
        .rf-desc {
          font-size: 1.05rem;
          color: #4b5563;
          line-height: 1.6;
        }
        .rf-form { display: flex; flex-direction: column; gap: 2rem; width: 100%; }
        .rf-field { display: flex; flex-direction: column; gap: 0.6rem; }
        .rf-label { font-size: 0.9rem; font-weight: 600; color: #374151; }
        .rf-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 14px;
          border: 1.5px solid #e5e7eb;
          font-size: 1rem;
          color: #111827;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: #f9fafb;
        }
        .rf-input:focus {
          border-color: #6d28d9;
          box-shadow: 0 0 0 4px rgba(109, 40, 217, 0.12);
          background-color: white;
          outline: none;
        }
        .rf-input-err { border-color: #ef4444; }
        .rf-err { font-size: 0.85rem; color: #ef4444; font-weight: 500; margin-top: 0.4rem; }
        .rf-eye {
          position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #9ca3af; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .rf-alert {
          padding: 1.125rem;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 14px;
          color: #b91c1c;
          font-size: 0.9rem;
        }
        .rf-btn {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 14px;
          background: #6d28d9;
          color: white !important;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(109, 40, 217, 0.3);
          margin-top: 0.5rem;
        }
        .rf-btn:hover { background: #5b21b6; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(109, 40, 217, 0.4); }
        .rf-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
        .rf-spin {
          width: 24px; height: 24px;
          border: 3.5px solid rgba(255,255,255,0.3); border-top-color: white;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        .rf-spin-emerald { border-color: rgba(16, 185, 129, 0.2); border-top-color: #10b981; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
