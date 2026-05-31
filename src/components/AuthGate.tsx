import { useEffect, useState, type FormEvent, type PropsWithChildren } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthGate({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    const credentials = { email: email.trim(), password }
    const { error: authError } =
      mode === 'sign-in'
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials)

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    if (mode === 'sign-up') {
      setMessage('Account created. If confirmation is enabled, check your email before signing in.')
    }
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (isLoading && !session) {
    return (
      <div className="auth-screen">
        <div className="auth-loader" aria-live="polite">Loading secure workspace...</div>
      </div>
    )
  }

  if (session) {
    return (
      <>
        <div className="auth-session-pill">
          <ShieldCheck size={15} />
          <span>{session.user.email}</span>
          <button type="button" onClick={handleSignOut}>Sign out</button>
        </div>
        {children}
      </>
    )
  }

  return (
    <main className="auth-screen">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <div><Sparkles size={26} /></div>
          <span>Habit Game</span>
        </div>
        <div className="auth-copy">
          <span>Secure dashboard access</span>
          <h1 id="auth-title">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h1>
          <p>Sign in to protect your habit dashboard, order bumps, and month-by-month progress.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <span>
              <Mail size={16} />
              <input
                type="email"
                value={email}
                autoComplete="email"
                placeholder="you@example.com"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>
          <label>
            Password
            <span>
              <LockKeyhole size={16} />
              <input
                type="password"
                value={password}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                placeholder="At least 6 characters"
                minLength={6}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </span>
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Working...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          className="auth-mode"
          type="button"
          onClick={() => {
            setMode((current) => current === 'sign-in' ? 'sign-up' : 'sign-in')
            setError('')
            setMessage('')
          }}
        >
          {mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  )
}
