'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { ROUTES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

/* ── Schemas ── */
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
})

const signupSchema = z
  .object({
    name: z.string().min(2, 'At least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['attendee', 'organizer', 'admin']),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type LoginValues = z.infer<typeof loginSchema>
type SignupValues = z.infer<typeof signupSchema>

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const router = useRouter()
  const { login, signup, isLoading } = useAuth()

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'attendee' },
  })

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m)
    setSubmitError(null)
    loginForm.reset()
    signupForm.reset()
    setShowPassword(false)
  }

  const redirectByRole = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(ROUTES.EVENTS); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || user.user_metadata?.role || 'attendee'
    if (role === 'admin') router.push(ROUTES.ADMIN_DASHBOARD)
    else if (role === 'organizer') router.push(ROUTES.ORGANIZER_DASHBOARD)
    else router.push(ROUTES.EVENTS)
  }

  const onLogin = async (data: LoginValues) => {
    setSubmitError(null)
    try {
      await login(data.email, data.password)
      await redirectByRole()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Invalid email or password')
    }
  }

  const onSignup = async (data: SignupValues) => {
    setSubmitError(null)
    try {
      await signup(data.email, data.password, data.name, data.role)
      if (data.role === 'admin') router.push(ROUTES.ADMIN_DASHBOARD)
      else if (data.role === 'organizer') router.push(ROUTES.ORGANIZER_DASHBOARD)
      else router.push(ROUTES.EVENTS)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create account')
    }
  }

  const handleSocial = async (provider: 'google' | 'github') => {
    setSocialLoading(provider)
    setSubmitError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : `Failed to sign in with ${provider}`)
      setSocialLoading(null)
    }
  }

  const busy = isLoading || !!socialLoading
  const roles = [
    { value: 'attendee', label: '🎟 Attendee' },
    { value: 'organizer', label: '📋 Organizer' },
    { value: 'admin', label: '🛡 Admin' },
  ] as const

  return (
    <>
      <div className="lf-outer">
        <Link href={ROUTES.HOME} className="lf-home-btn" aria-label="Go to home">
          Home
        </Link>
        {/* ── Left panel: hero image ── */}
        <div className="lf-hero">
          <Image
            src="/images/tech cartoon.png"
            fill
            style={{ objectFit: 'cover', objectPosition: 'left center' }}
            alt="Hero"
            priority
          />
        </div>

        {/* ── Right panel: card centered ── */}
        <div className="lf-card-wrap">
          <div className="lf-card">

          {/* Logo */}
          <div className="lf-logo">
            <span className="lf-logo-icon">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 1L18 5.5V14.5L10 19L2 14.5V5.5L10 1Z" fill="#6d28d9"/>
                <path d="M6.5 10L9 12.5L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="lf-logo-text">EventEase</span>
          </div>

          {/* Tab switcher */}
          <div className="lf-tabs">
            <button
              className={`lf-tab ${mode === 'login' ? 'lf-tab-active' : ''}`}
              onClick={() => switchMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`lf-tab ${mode === 'signup' ? 'lf-tab-active' : ''}`}
              onClick={() => switchMode('signup')}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="lf-form" noValidate>
              <Field label="Email">
                <input
                  type="email"
                  placeholder="johndoe@example.com"
                  className={`lf-input ${loginForm.formState.errors.email ? 'lf-input-err' : ''}`}
                  disabled={busy}
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && <Err msg={loginForm.formState.errors.email.message!} />}
              </Field>

              <Field label="Password">
                <PwWrap show={showPassword} onToggle={() => setShowPassword(v => !v)}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`lf-input lf-input-pr ${loginForm.formState.errors.password ? 'lf-input-err' : ''}`}
                    disabled={busy}
                    {...loginForm.register('password')}
                  />
                </PwWrap>
                {loginForm.formState.errors.password && <Err msg={loginForm.formState.errors.password.message!} />}
              </Field>

              <div className="lf-forgot-row">
                <Link href={ROUTES.RESET_PASSWORD} className="lf-forgot">Forgot password?</Link>
              </div>

              {submitError && <div className="lf-alert">{submitError}</div>}

              <button type="submit" className="lf-btn" disabled={busy}>
                {isLoading ? <Spinner /> : 'Sign In'}
              </button>

              <Divider />
              <SocialRow loading={socialLoading} onSocial={handleSocial} busy={busy} />

              <p className="lf-switch">
                Don&apos;t have an account?{' '}
                <button type="button" className="lf-switch-btn" onClick={() => switchMode('signup')}>
                  Create account
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {mode === 'signup' && (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="lf-form" noValidate>
              <Field label="Full Name">
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`lf-input ${signupForm.formState.errors.name ? 'lf-input-err' : ''}`}
                  disabled={busy}
                  {...signupForm.register('name')}
                />
                {signupForm.formState.errors.name && <Err msg={signupForm.formState.errors.name.message!} />}
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  placeholder="johndoe@example.com"
                  className={`lf-input ${signupForm.formState.errors.email ? 'lf-input-err' : ''}`}
                  disabled={busy}
                  {...signupForm.register('email')}
                />
                {signupForm.formState.errors.email && <Err msg={signupForm.formState.errors.email.message!} />}
              </Field>

              <Field label="Password">
                <PwWrap show={showPassword} onToggle={() => setShowPassword(v => !v)}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`lf-input lf-input-pr ${signupForm.formState.errors.password ? 'lf-input-err' : ''}`}
                    disabled={busy}
                    {...signupForm.register('password')}
                  />
                </PwWrap>
                {signupForm.formState.errors.password && <Err msg={signupForm.formState.errors.password.message!} />}
              </Field>

              <Field label="Confirm Password">
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`lf-input ${signupForm.formState.errors.confirmPassword ? 'lf-input-err' : ''}`}
                  disabled={busy}
                  {...signupForm.register('confirmPassword')}
                />
                {signupForm.formState.errors.confirmPassword && <Err msg={signupForm.formState.errors.confirmPassword.message!} />}
              </Field>

              {/* Role selection */}
              <Field label="I am a...">
                <div className="lf-roles">
                  {roles.map(r => (
                    <label key={r.value} className="lf-role-label">
                      <input type="radio" value={r.value} {...signupForm.register('role')} className="sr-only" />
                      <span className={`lf-role-chip ${signupForm.watch('role') === r.value ? 'lf-role-active' : ''}`}>
                        {r.label}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              {submitError && <div className="lf-alert">{submitError}</div>}

              <button type="submit" className="lf-btn" disabled={busy}>
                {isLoading ? <Spinner /> : 'Create Account'}
              </button>

              <Divider />
              <SocialRow loading={socialLoading} onSocial={handleSocial} busy={busy} />

              <p className="lf-switch">
                Already have an account?{' '}
                <button type="button" className="lf-switch-btn" onClick={() => switchMode('login')}>
                  Log in
                </button>
              </p>
            </form>
          )}
          </div>
        </div>
      </div>
      
      {/* ── Styles ── */}
      <style jsx global>{`
        /* Outer split wrapper */
        .lf-outer {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        /* Left panel — hero image */
        .lf-hero {
          position: relative;
          flex: 0 0 55%;
          height: 100vh;
          background-color: #d4edda;
          border-radius: 24px;
          overflow: hidden;
          margin: 1.5rem;
        }

        /* Right panel — card centered */
        .lf-card-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background-color: #f0f4f8;
        }

        .lf-home-btn {
          position: fixed;
          top: 18px;
          right: 18px;
          z-index: 60;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          border-radius: 9999px;
          border: 1.5px solid #16a34a;
          background: linear-gradient(90deg, #22c55e, #16a34a);
          color: white;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 6px 18px rgba(22,163,74,0.25);
          transition: transform 0.1s, box-shadow 0.15s, background 0.15s;
        }

        .lf-home-btn:hover {
          box-shadow: 0 10px 26px rgba(22,163,74,0.35);
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .lf-outer { flex-direction: column; }
          .lf-hero { flex: 0 0 50%; width: 100%; }
          .lf-card-wrap { flex: 1; padding: 1rem; }
        }
        @media (max-width: 640px) {
          .lf-hero { display: none; }
          .lf-card-wrap { background-color: #d4edda; }
        }

        /* The white bordered card */
        .lf-card {
          width: 100%;
          max-width: 560px;
          background: rgba(255, 255, 255, 0.97);
          border: 2px solid #e5e7eb;
          border-radius: 20px;
          padding: 2.5rem 2.5rem 2.25rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), 0 4px 20px rgba(0,0,0,0.08);
          font-family: 'Inter', 'Geist', -apple-system, sans-serif;
          backdrop-filter: blur(4px);
          overflow-y: auto;
          max-height: 95vh;
        }

        /* Logo */
        .lf-logo {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-bottom: 1.4rem;
        }
        .lf-logo-icon {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px;
          background: #ede9fe;
          border-radius: 7px;
        }
        .lf-logo-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: #4c1d95;
        }

        /* Tabs */
        .lf-tabs {
          display: flex;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 3px;
          margin-bottom: 1.4rem;
          gap: 3px;
        }
        .lf-tab {
          flex: 1;
          padding: 0.45rem 0;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .lf-tab-active {
          background: #ffffff;
          color: #4c1d95;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        /* Form */
        .lf-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .lf-field {
          display: flex; flex-direction: column; gap: 0.3rem;
        }
        .lf-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
        }
        .lf-input {
          width: 100%;
          padding: 0.62rem 0.85rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 9px;
          font-size: 0.875rem;
          color: #111827;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .lf-input::placeholder { color: #9ca3af; }
        .lf-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }
        .lf-input-pr { padding-right: 2.5rem; }
        .lf-input-err { border-color: #ef4444 !important; }
        .lf-err { font-size: 0.74rem; color: #ef4444; }

        /* Password wrapper */
        .lf-pw-wrap { position: relative; }
        .lf-pw-eye {
          position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #9ca3af; cursor: pointer;
          display: flex; align-items: center; padding: 0;
        }
        .lf-pw-eye:hover { color: #4b5563; }

        /* Forgot */
        .lf-forgot-row { display: flex; justify-content: flex-end; margin-top: -0.2rem; }
        .lf-forgot {
          font-size: 0.78rem; color: #7c3aed; text-decoration: none; font-weight: 500;
        }
        .lf-forgot:hover { text-decoration: underline; }

        /* Alert */
        .lf-alert {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          border-radius: 8px; padding: 0.55rem 0.8rem; font-size: 0.8rem;
        }

        /* Primary button */
        .lf-btn {
          width: 100%;
          padding: 0.7rem;
          border-radius: 10px;
          background: linear-gradient(90deg, #7c3aed, #6d28d9);
          color: white;
          font-size: 0.92rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(124,58,237,0.35);
          letter-spacing: 0.01em;
        }
        .lf-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.45);
        }
        .lf-btn:active:not(:disabled) { transform: translateY(0); }
        .lf-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Spinner */
        .lf-spin {
          display: inline-block; width: 17px; height: 17px;
          border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white;
          border-radius: 50%; animation: lfSpin 0.7s linear infinite;
        }
        @keyframes lfSpin { to { transform: rotate(360deg); } }

        /* Roles */
        .lf-roles { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .lf-role-label { cursor: pointer; }
        .lf-role-chip {
          display: inline-block; padding: 0.3rem 0.7rem;
          border-radius: 20px; border: 1.5px solid #e5e7eb;
          font-size: 0.78rem; font-weight: 500; color: #6b7280;
          background: #fff; transition: all 0.15s; cursor: pointer; user-select: none;
        }
        .lf-role-active {
          border-color: #7c3aed; background: #ede9fe; color: #4c1d95;
        }

        /* Divider */
        .lf-divider {
          display: flex; align-items: center; gap: 0.6rem; margin: 0.2rem 0;
        }
        .lf-divider-line { flex: 1; height: 1px; background: #e5e7eb; }
        .lf-divider-text { font-size: 0.75rem; color: #9ca3af; white-space: nowrap; }

        /* Social buttons */
        .lf-social-row { display: flex; gap: 0.6rem; justify-content: center; }
        .lf-social-btn {
          display: flex; align-items: center; justify-content: center;
          width: 44px; height: 44px;
          border-radius: 50%; border: 1.5px solid #e5e7eb; background: #fff;
          cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
          color: #111827;
        }
        .lf-social-btn:hover:not(:disabled) {
          border-color: #7c3aed;
          box-shadow: 0 2px 10px rgba(124,58,237,0.2);
          transform: translateY(-2px);
        }
        .lf-social-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .lf-social-spin {
          display: inline-block; width: 15px; height: 15px;
          border: 2px solid rgba(124,58,237,0.2); border-top-color: #7c3aed;
          border-radius: 50%; animation: lfSpin 0.7s linear infinite;
        }

        /* Switch */
        .lf-switch { text-align: center; font-size: 0.82rem; color: #6b7280; margin-top: 0.2rem; }
        .lf-switch-btn {
          background: none; border: none; color: #7c3aed; font-weight: 700;
          cursor: pointer; font-size: inherit; padding: 0;
        }
        .lf-switch-btn:hover { text-decoration: underline; }
      `}</style>
    </>
  )
}

/* ── Sub-components ── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="lf-field">
      <label className="lf-label">{label}</label>
      {children}
    </div>
  )
}

function Err({ msg }: { msg: string }) {
  return <span className="lf-err">{msg}</span>
}

function Spinner() {
  return <span className="lf-spin" />
}

function PwWrap({
  show,
  onToggle,
  children,
}: {
  show: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="lf-pw-wrap">
      {children}
      <button type="button" className="lf-pw-eye" onClick={onToggle} tabIndex={-1} aria-label={show ? 'Hide' : 'Show'}>
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

function Divider() {
  return (
    <div className="lf-divider">
      <span className="lf-divider-line" />
      <span className="lf-divider-text">or continue with</span>
      <span className="lf-divider-line" />
    </div>
  )
}

function SocialRow({
  loading,
  onSocial,
  busy,
}: {
  loading: string | null
  onSocial: (p: 'google' | 'github') => void
  busy: boolean
}) {
  return (
    <div className="lf-social-row">
      <button type="button" className="lf-social-btn" onClick={() => onSocial('google')} disabled={busy} aria-label="Google">
        {loading === 'google' ? <span className="lf-social-spin" /> : (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
      </button>

      <button type="button" className="lf-social-btn" onClick={() => onSocial('github')} disabled={busy} aria-label="GitHub">
        {loading === 'github' ? <span className="lf-social-spin" /> : (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill="currentColor"/>
          </svg>
        )}
      </button>
    </div>
  )
}
