import { useEffect, useState, type FormEvent, type PropsWithChildren } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthGate({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [isLoading, setIsLoading] = useState(true)
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
          <img src="/habtrack-logo.png" alt="HabTrack" />
        </div>
        <div className="auth-copy">
          <span>Acesso seguro ao dashboard</span>
          <h1 id="auth-title">{mode === 'sign-in' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
          <p>Faça login para proteger seu painel de hábitos, seus pedidos adicionais e seu progresso mês a mês.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <span>
              <Mail size={16} />
              <input
                type="email"
                value={email}
                autoComplete="email"
                placeholder="contato@exemplo.com"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>
          <label>
            Senha
            <span>
              <LockKeyhole size={16} />
              <input
                type="password"
                value={password}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                placeholder="Pelo menos 6 caracteres"
                minLength={6}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </span>
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Carregando...' : mode === 'sign-in' ? 'Iniciar sessão' : 'Criar uma conta'}
          </button>
        </form>

        <button
          className="auth-mode"
          type="button"
          onClick={() => {
            setMode((current) => current === 'sign-in' ? 'sign-up' : 'sign-in')
            setError('')
          }}
        >
          {mode === 'sign-in' ? 'Precisa de uma conta? Criar uma' : 'Já tem uma conta? Iniciar sessão'}
        </button>
      </section>
    </main>
  )
}
