import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts'
import { Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react'
import nationalEmblem from '../../../images/national.png'
import rgdLogo from '../../../images/RGD.png'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4 font-sans text-slate-900 antialiased">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xl ring-1 ring-slate-900/5">
              <img src={nationalEmblem} alt="National Emblem of Sri Lanka" className="h-9 w-auto object-contain mix-blend-multiply" />
            </div>
            <span className="text-lg font-thin text-slate-500">|</span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xl ring-1 ring-slate-900/5">
              <img src={rgdLogo} alt="Registrar General's Department Logo" className="h-9 w-auto object-contain mix-blend-multiply" />
            </div>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 text-xs font-semibold text-blue-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Authorised Staff Only
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-tr from-blue-600/40 to-cyan-400/20 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-9">
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Internal Staff
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Login
                </span>
              </h1>
              <p className="mt-2 text-sm font-light text-slate-300">
                Sign in to the Electronic Trust Registration System
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-200">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none backdrop-blur transition-all focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="you@domain.gov.lk"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-200">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none backdrop-blur transition-all focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-7 flex items-center justify-center gap-6 border-t border-white/10 pt-6 text-xs text-slate-400">
              <Link to="/activate" className="inline-flex items-center gap-1.5 text-blue-300 transition-colors hover:text-blue-200">
                <KeyRound className="h-3.5 w-3.5" />
                Activate account
              </Link>
              <span className="h-3 w-px bg-white/10" />
              <Link to="/forgot-password" className="text-blue-300 transition-colors hover:text-blue-200">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 text-blue-400" />
            Secure encrypted connection
          </div>
          <Link to="/" className="text-xs text-slate-400 transition-colors hover:text-white">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
