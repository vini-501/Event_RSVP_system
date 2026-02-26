'use client'

import { useEffect, useState } from 'react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export default function ResetPasswordPage() {
  const [isRecovery, setIsRecovery] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      
      // Check hash for recovery tokens
      const hash = window.location.hash
      if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
        setIsRecovery(true)
      }

      // Also check onAuthStateChange for PASSWORD_RECOVERY event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovery(true)
        }
      })

      setIsLoading(false)
      return () => subscription.unsubscribe()
    }

    void checkSession()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="lf-outer">
      {/* Left panel — hero image */}
      <div className="lf-hero">
        <Image
          src="/images/tech cartoon.png"
          fill
          style={{ objectFit: 'cover', objectPosition: 'left center' }}
          alt="Password Reset Background"
          priority
        />
        <div className="absolute inset-0 bg-indigo-900/10 backdrop-blur-[2px]" />
      </div>

      {/* Right panel — card centered */}
      <div className="lf-card-wrap">
        <div className="lf-card">
          {/* Logo & Home Link (Same as Login) */}
          <div className="lf-header-top">
            <div className="lf-logo">
              <span className="lf-logo-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 1L18 5.5V14.5L10 19L2 14.5V5.5L10 1Z" fill="#6d28d9"/>
                  <path d="M6.5 10L9 12.5L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="lf-logo-text">EventEase</span>
            </div>
            <Link href={ROUTES.HOME} className="lf-home-link" aria-label="Go to home">
              <ArrowLeft size={14} />
              Home
            </Link>
          </div>

          <div className="w-full">
            {isRecovery ? <UpdatePasswordForm /> : <ResetPasswordForm />}
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Re-using identical classes from login-form.tsx for consistency */
        .lf-outer {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background-color: #f0f4f8;
        }

        .lf-hero {
          position: relative;
          flex: 0 0 55%;
          height: calc(100vh - 3rem);
          background-color: #d4edda;
          border-radius: 24px;
          overflow: hidden;
          margin: 1.5rem;
        }

        .lf-card-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .lf-card {
          width: 100%;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
        }

        .lf-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .lf-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .lf-logo-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
          background: #ede9fe;
          border-radius: 6px;
        }

        .lf-logo-text {
          font-size: 1rem;
          font-weight: 700;
          color: #4c1d95;
        }

        .lf-home-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          color: #6b7280;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }

        .lf-home-link:hover {
          background: #f3f4f6;
          color: #111827;
        }

        @media (max-width: 1024px) {
          .lf-hero { flex: 0 0 45%; }
        }

        @media (max-width: 768px) {
          .lf-hero { display: none; }
          .lf-outer { background-color: #d4edda; }
          .lf-card-wrap { padding: 1.5rem; }
        }
      `}</style>
    </div>
  )
}
